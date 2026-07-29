import { v4 as uuidv4 } from "uuid";
import { PracticeRepository } from "../../repositories/PracticeRepository.js";
import { ConceptRepository } from "../../repositories/ConceptRepository.js";
import { AIOrchestrator } from "../ai/orchestrator.js";
import { PromptManager } from "../../prompts/PromptManager.js";
import type { PracticeAttempt } from "../../models/index.js";

export interface AssessmentResult {
  attemptId: string;
  understandingScore: number;
  confidenceEstimate: number;
  strengths: string[];
  weaknesses: string[];
  misconceptions: string[];
  improvementSuggestions: string[];
  nextSteps: string[];
}

export class AssessmentEngine {
  private practiceRepo = new PracticeRepository();
  private conceptRepo = new ConceptRepository();
  private aiOrchestrator: AIOrchestrator;
  private promptManager: PromptManager;

  constructor(aiOrchestrator?: AIOrchestrator, promptManager?: PromptManager) {
    this.aiOrchestrator = aiOrchestrator || new AIOrchestrator();
    this.promptManager = promptManager || new PromptManager();
  }

  async assessSubmission(
    userId: string,
    conceptId: string,
    userAnswer: string,
    context?: { previousAttempts?: PracticeAttempt[] }
  ): Promise<AssessmentResult> {
    const concept = await this.conceptRepo.findById(conceptId);
    if (!concept) throw new Error("Concept not found");

    const history = await this.practiceRepo.findByUser(userId, 20);
    const conceptHistory = history.data.filter((a) => a.conceptId === conceptId);
    const recentScore = conceptHistory.length > 0
      ? conceptHistory.reduce((sum, a) => sum + a.score, 0) / conceptHistory.length
      : 0.5;

    const prompt = this.promptManager.getEvaluateAnalogyPrompt({
      concept: concept.title,
      analogy: userAnswer,
      expectedConcepts: [concept.title],
    });

    const aiResponse = await this.aiOrchestrator.complete("EvaluateAnalogy", {
      concept: concept.title,
      analogy: userAnswer,
    });

    const parsed = this.parseAssessment(aiResponse.content);

    const attempt = await this.practiceRepo.create({
      userId,
      mode: "assessment",
      conceptId,
      userAnswer,
      feedback: { raw: aiResponse.content },
      score: parsed.understandingScore,
      strengths: parsed.strengths,
      weaknesses: parsed.weaknesses,
      misconceptions: parsed.misconceptions,
      suggestions: parsed.suggestions,
    });

    const blendedScore = (parsed.understandingScore + recentScore) / 2;

    const nextSteps = this.generateNextSteps(parsed, concept);

    return {
      attemptId: attempt.id,
      understandingScore: blendedScore,
      confidenceEstimate: parsed.confidence,
      strengths: parsed.strengths,
      weaknesses: parsed.weaknesses,
      misconceptions: parsed.misconceptions,
      improvementSuggestions: parsed.suggestions,
      nextSteps,
    };
  }

  async getProgressSummary(userId: string, conceptId?: string) {
    const result = conceptId
      ? await this.practiceRepo.findByUser(userId, 100)
      : await this.practiceRepo.findByUser(userId, 100);
    const attempts = conceptId
      ? result.data.filter((a) => a.conceptId === conceptId)
      : result.data;

    if (attempts.length === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        strongAreas: [],
        weakAreas: [],
        misconceptions: [],
      };
    }

    const totalScore = attempts.reduce((sum, a) => sum + a.score, 0);
    const avgScore = totalScore / attempts.length;

    const byConcept = new Map<string, { total: number; count: number; misconceptions: string[] }>();
    for (const attempt of attempts) {
      if (!attempt.conceptId) continue;
      const current = byConcept.get(attempt.conceptId) || { total: 0, count: 0, misconceptions: [] };
      current.total += attempt.score;
      current.count += 1;
      current.misconceptions.push(...attempt.misconceptions);
      byConcept.set(attempt.conceptId, current);
    }

    const strongAreas: string[] = [];
    const weakAreas: string[] = [];
    const allMisconceptions: string[] = [];

    for (const [conceptId, data] of byConcept) {
      const avg = data.total / data.count;
      if (avg >= 0.75) strongAreas.push(conceptId);
      else if (avg < 0.5) weakAreas.push(conceptId);
      allMisconceptions.push(...data.misconceptions);
    }

    return {
      totalAttempts: attempts.length,
      averageScore: avgScore,
      strongAreas,
      weakAreas,
      misconceptions: [...new Set(allMisconceptions)],
    };
  }

  private parseAssessment(content: string): {
    strengths: string[];
    weaknesses: string[];
    misconceptions: string[];
    suggestions: string[];
    understandingScore: number;
    confidence: number;
  } {
    const lines = content.split("\n").filter((l) => l.trim());
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const misconceptions: string[] = [];
    const suggestions: string[] = [];
    let understandingScore = 0.5;
    let confidence = 0.5;

    let section: string | null = null;

    for (const line of lines) {
      const lower = line.toLowerCase().trim();
      if (lower.startsWith("strengths")) { section = "strengths"; continue; }
      if (lower.startsWith("weaknesses")) { section = "weaknesses"; continue; }
      if (lower.startsWith("misconceptions")) { section = "misconceptions"; continue; }
      if (lower.startsWith("suggestions")) { section = "suggestions"; continue; }
      if (lower.startsWith("understanding_score")) { section = "score"; continue; }
      if (lower.startsWith("confidence")) { section = "confidence"; continue; }

      if (section === "strengths" && line.trim().startsWith("-")) {
        strengths.push(line.trim().replace(/^-\s*/, ""));
      } else if (section === "weaknesses" && line.trim().startsWith("-")) {
        weaknesses.push(line.trim().replace(/^-\s*/, ""));
      } else if (section === "misconceptions" && line.trim().startsWith("-")) {
        misconceptions.push(line.trim().replace(/^-\s*/, ""));
      } else if (section === "suggestions" && line.trim().startsWith("-")) {
        suggestions.push(line.trim().replace(/^-\s*/, ""));
      } else if (section === "score") {
        const match = line.match(/(\d+\.?\d*)/);
        if (match) understandingScore = Math.min(1, Math.max(0, parseFloat(match[1])));
      } else if (section === "confidence") {
        const match = line.match(/(\d+\.?\d*)/);
        if (match) confidence = Math.min(1, Math.max(0, parseFloat(match[1])));
      }
    }

    return { strengths, weaknesses, misconceptions, suggestions, understandingScore, confidence };
  }

  private generateNextSteps(parsed: ReturnType<typeof this.parseAssessment>, concept: any): string[] {
    const steps: string[] = [];

    if (parsed.weaknesses.length > 0) {
      steps.push("Review weaknesses: " + parsed.weaknesses[0]);
    }

    if (parsed.misconceptions.length > 0) {
      steps.push("Address misconception: " + parsed.misconceptions[0]);
    }

    steps.push("Practice more examples for " + concept.title);
    steps.push("Try creating your own analogy for " + concept.title);

    return steps.slice(0, 4);
  }
}
