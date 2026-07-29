import { ConceptRepository } from "../../repositories/ConceptRepository.js";
import { RelationshipRepository } from "../../repositories/RelationshipRepository.js";
import { PracticeRepository } from "../../repositories/PracticeRepository.js";
import { LearningPathRepository } from "../../repositories/LearningPathRepository.js";
import { KnowledgeGraphEngine, type GraphNode } from "../graph/engine.js";
import { SearchEngine, type SearchResult } from "../search/engine.js";
import type { Concept, PracticeAttempt } from "../../models/index.js";

export interface Recommendation {
  type: "concept" | "practice" | "analogy" | "path";
  id: string;
  title: string;
  reason: string;
  priority: number;
  metadata?: Record<string, unknown>;
}

export interface WeakConcept {
  conceptId: string;
  conceptTitle: string;
  avgScore: number;
  attempts: number;
}

export class RecommendationEngine {
  private conceptRepo = new ConceptRepository();
  private relationshipRepo = new RelationshipRepository();
  private practiceRepo = new PracticeRepository();
  private learningPathRepo = new LearningPathRepository();
  private graphEngine = new KnowledgeGraphEngine();
  private searchEngine = new SearchEngine();

  async recommendForUser(userId: string, limit = 10): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    const weakConcepts = await this.findWeakConcepts(userId);
    for (const weak of weakConcepts.slice(0, 3)) {
      recommendations.push({
        type: "practice",
        id: weak.conceptId,
        title: `Practice: ${weak.conceptTitle}`,
        reason: `Your average score is ${weak.avgScore.toFixed(2)}. Review this concept.`,
        priority: 0.9,
        metadata: { avgScore: weak.avgScore, attempts: weak.attempts },
      });
    }

    const activePaths = await this.learningPathRepo.findByUser(userId);
    if (activePaths.length > 0) {
      const currentPath = activePaths[0];
      const currentStage = currentPath.stages[currentPath.currentStage];
      if (currentStage && !currentStage.completed) {
        const concept = await this.conceptRepo.findByTitle(currentStage.key);
        if (concept) {
          const prereqs = await this.graphEngine.findPrerequisites(concept.id);
          const missingPrereqs = prereqs.filter((pid) => !currentPath.completedConcepts.includes(pid));

          for (const pid of missingPrereqs.slice(0, 3)) {
            const prereqConcept = await this.conceptRepo.findById(pid);
            if (prereqConcept) {
              recommendations.push({
                type: "concept",
                id: prereqConcept.id,
                title: `Learn: ${prereqConcept.title}`,
                reason: `Prerequisite for ${concept.title}`,
                priority: 0.85,
                metadata: { prerequisiteFor: concept.id },
              });
            }
          }
        }
      }
    }

    const recentPractices = await this.practiceRepo.findByUser(userId, 5);
    const practicedConceptIds = new Set(recentPractices.data.map((p) => p.conceptId).filter(Boolean));
    const explored = new Set<string>();

    for (const attempt of recentPractices.data) {
      if (!attempt.conceptId || explored.has(attempt.conceptId)) continue;
      explored.add(attempt.conceptId);

      if (attempt.score < 0.7) {
        const neighbors = await this.graphEngine.getNeighbors(attempt.conceptId, "both");
        for (const neighbor of neighbors.slice(0, 2)) {
          if (!practicedConceptIds.has(neighbor.id)) {
            recommendations.push({
              type: "concept",
              id: neighbor.id,
              title: `Explore: ${neighbor.label}`,
              reason: `Related to ${attempt.conceptId}`,
              priority: 0.6,
              metadata: { category: neighbor.category },
            });
          }
        }
      }
    }

    const nextLesson = await this.suggestNextLesson(userId);
    if (nextLesson) {
      recommendations.push(nextLesson);
    }

    return recommendations.sort((a, b) => b.priority - a.priority).slice(0, limit);
  }

  async recommendAnalogies(conceptId: string, limit = 5): Promise<Recommendation[]> {
    const results: Recommendation[] = [];
    const searchResults = await this.searchEngine.searchSimilarConcepts(conceptId, limit * 2);

    for (const result of searchResults.slice(0, limit)) {
      results.push({
        type: "analogy",
        id: result.id,
        title: `Analogy: ${result.title}`,
        reason: "Similar concept with analogy",
        priority: result.score,
        metadata: result.metadata,
      });
    }

    return results;
  }

  async findKnowledgeGaps(userId: string): Promise<Recommendation[]> {
    const gaps: Recommendation[] = [];
    const allUserPractices = await this.practiceRepo.findByUser(userId, 100);

    const weakConcepts: WeakConcept[] = [];
    const conceptScores = new Map<string, { total: number; count: number }>();

    for (const attempt of allUserPractices.data) {
      if (!attempt.conceptId) continue;
      const current = conceptScores.get(attempt.conceptId) || { total: 0, count: 0 };
      conceptScores.set(attempt.conceptId, { total: current.total + attempt.score, count: current.count + 1 });
    }

    for (const [conceptId, { total, count }] of conceptScores) {
      const avgScore = total / count;
      if (avgScore < 0.6 && count >= 2) {
        const concept = await this.conceptRepo.findById(conceptId);
        weakConcepts.push({
          conceptId,
          conceptTitle: concept?.title || conceptId,
          avgScore,
          attempts: count,
        });
      }
    }

    for (const weak of weakConcepts.slice(0, 5)) {
      gaps.push({
        type: "practice",
        id: weak.conceptId,
        title: `Knowledge gap: ${weak.conceptTitle}`,
        reason: `Consistently low scores (${weak.avgScore.toFixed(2)} avg) across ${weak.attempts} attempts`,
        priority: 0.9,
        metadata: { avgScore: weak.avgScore, attempts: weak.attempts },
      });
    }

    return gaps;
  }

  private async findWeakConcepts(userId: string): Promise<WeakConcept[]> {
    const attempts = await this.practiceRepo.findByUser(userId, 100);
    const conceptScores = new Map<string, { total: number; count: number; title: string }>();

    for (const attempt of attempts.data) {
      if (!attempt.conceptId) continue;
      const current = conceptScores.get(attempt.conceptId) || { total: 0, count: 0, title: attempt.conceptId };
      conceptScores.set(attempt.conceptId, {
        total: current.total + attempt.score,
        count: current.count + 1,
        title: current.title,
      });
    }

    const weakConcepts: WeakConcept[] = [];
    for (const [conceptId, { total, count, title }] of conceptScores) {
      const avg = total / count;
      if (avg < 0.7) {
        const concept = await this.conceptRepo.findById(conceptId);
        weakConcepts.push({
          conceptId,
          conceptTitle: concept?.title || title,
          avgScore: avg,
          attempts: count,
        });
      }
    }

    return weakConcepts.sort((a, b) => a.avgScore - b.avgScore);
  }

  private async suggestNextLesson(userId: string): Promise<Recommendation | null> {
    const activePaths = await this.learningPathRepo.findByUser(userId);
    if (activePaths.length === 0) {
      const allConcepts = await this.conceptRepo.findAll(10);
      const first = allConcepts.data[0];
      if (first) {
        return {
          type: "concept",
          id: first.id,
          title: `Start learning: ${first.title}`,
          reason: "No active learning path. Start with this concept.",
          priority: 0.7,
          metadata: { difficulty: first.difficulty },
        };
      }
      return null;
    }

    const path = activePaths[0];
    if (path.currentStage >= path.stages.length) {
      return {
        type: "path",
        id: path.id,
        title: `Finish: ${path.title}`,
        reason: "Complete your current learning path.",
        priority: 0.8,
      };
    }

    const stage = path.stages[path.currentStage];
    return {
      type: "concept",
      id: stage.key,
      title: `Continue: ${stage.label}`,
      reason: stage.description || `Stage ${path.currentStage + 1} of your learning path`,
      priority: 0.75,
      metadata: { stageIndex: path.currentStage, pathId: path.id },
    };
  }
}
