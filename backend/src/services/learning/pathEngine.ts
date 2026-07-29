import { ConceptRepository } from "../../repositories/ConceptRepository.js";
import { PracticeRepository } from "../../repositories/PracticeRepository.js";
import { LearningPathRepository } from "../../repositories/LearningPathRepository.js";
import { KnowledgeGraphEngine } from "../graph/engine.js";
import { v4 as uuidv4 } from "uuid";
import type { Concept, LearningPath, LearningStage, PracticeAttempt } from "../../models/index.js";

export interface LearnerProfile {
  userId: string;
  strongConcepts: string[];
  weakConcepts: string[];
  completedConcepts: string[];
  currentLevel: "beginner" | "intermediate" | "advanced";
}

export class LearningPathEngine {
  private conceptRepo = new ConceptRepository();
  private practiceRepo = new PracticeRepository();
  private learningPathRepo = new LearningPathRepository();
  private graphEngine = new KnowledgeGraphEngine();

  async buildAdaptivePath(userId: string, goalConceptId: string): Promise<LearningPath> {
    const goalConcept = await this.conceptRepo.findById(goalConceptId);
    if (!goalConcept) throw new Error("Goal concept not found");

    const profile = await this.buildLearnerProfile(userId);

    const prerequisites = this.graphEngine.findPrerequisites(goalConceptId);
    const missingPrereqs = prerequisites.filter((id) => !profile.completedConcepts.includes(id));

    const stages: LearningStage[] = [];

    for (const prereqId of missingPrereqs) {
      const concept = await this.conceptRepo.findById(prereqId);
      if (concept) {
        stages.push({
          key: concept.id,
          label: concept.title,
          description: "Prerequisite: " + concept.definition.slice(0, 100),
          icon: "📚",
          completed: false,
          active: false,
        });
      }
    }

    stages.push({
      key: goalConcept.id,
      label: goalConcept.title,
      description: goalConcept.definition,
      icon: "🎯",
      completed: false,
      active: false,
    });

    const neighbors = this.graphEngine.getNeighbors(goalConceptId, "both");
    const relatedAdvanced = neighbors.filter((n) => n.difficulty === "advanced").slice(0, 3);

    for (const related of relatedAdvanced) {
      stages.push({
        key: related.id,
        label: related.label,
        description: "Advanced topic related to " + goalConcept.title,
        icon: "🚀",
        completed: false,
        active: false,
      });
    }

    const learningPath = await this.learningPathRepo.create({
      userId,
      title: "Path to " + goalConcept.title,
      stages,
      currentStage: 0,
      completedConcepts: profile.completedConcepts,
    });

    return learningPath;
  }

  async buildLearnerProfile(userId: string): Promise<LearnerProfile> {
    const attempts = await this.practiceRepo.findByUser(userId, 200);
    const conceptScores = new Map<string, { total: number; count: number }>();
    const completedConcepts = new Set<string>();

    for (const attempt of attempts.data) {
      if (!attempt.conceptId) continue;
      if (attempt.score >= 0.8) completedConcepts.add(attempt.conceptId);

      const current = conceptScores.get(attempt.conceptId) || { total: 0, count: 0 };
      conceptScores.set(attempt.conceptId, { total: current.total + attempt.score, count: current.count + 1 });
    }

    const strongConcepts: string[] = [];
    const weakConcepts: string[] = [];

    for (const [conceptId, { total, count }] of conceptScores) {
      const avg = total / count;
      if (avg >= 0.8) strongConcepts.push(conceptId);
      else if (avg < 0.5) weakConcepts.push(conceptId);
    }

    let currentLevel: LearnerProfile["currentLevel"] = "beginner";
    if (strongConcepts.length >= 5 && weakConcepts.length < 3) {
      currentLevel = "advanced";
    } else if (strongConcepts.length >= 2) {
      currentLevel = "intermediate";
    }

    return {
      userId,
      strongConcepts,
      weakConcepts,
      completedConcepts: Array.from(completedConcepts),
      currentLevel,
    };
  }

  async getNextTopic(userId: string): Promise<{ conceptId: string; reason: string } | null> {
    const activePaths = await this.learningPathRepo.findByUser(userId);

    if (activePaths.length > 0) {
      const path = activePaths[0];
      if (path.currentStage < path.stages.length) {
        const stage = path.stages[path.currentStage];
        return { conceptId: stage.key, reason: stage.description || "Continue your current path" };
      }
    }

    const profile = await this.buildLearnerProfile(userId);
    if (profile.strongConcepts.length > 0) {
      const lastStrong = profile.strongConcepts[profile.strongConcepts.length - 1];
      const neighbors = this.graphEngine.getNeighbors(lastStrong, "outgoing");
      const next = neighbors.find((n) => !profile.completedConcepts.includes(n.id));
      if (next) {
        return { conceptId: next.id, reason: "Next step from " + lastStrong };
      }
    }

    return null;
  }

  async estimateMasteryTime(userId: string, conceptId: string): Promise<{ estimatedMinutes: number; confidence: number }> {
    const profile = await this.buildLearnerProfile(userId);
    const concept = await this.conceptRepo.findById(conceptId);
    if (!concept) return { estimatedMinutes: 30, confidence: 0.5 };

    let baseTime = 15;
    if (concept.difficulty === "intermediate") baseTime = 30;
    if (concept.difficulty === "advanced") baseTime = 45;

    if (profile.currentLevel === "advanced" && concept.difficulty === "beginner") baseTime = 10;
    if (profile.currentLevel === "beginner" && concept.difficulty === "advanced") baseTime = 60;

    const prereqs = this.graphEngine.findPrerequisites(conceptId);
    const weakPrereqs = prereqs.filter((id) => profile.weakConcepts.includes(id));
    baseTime += weakPrereqs.length * 15;

    const confidence = Math.min(0.9, 0.5 + profile.strongConcepts.length * 0.05);

    return { estimatedMinutes: baseTime, confidence };
  }
}
