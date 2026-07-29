import { v4 as uuidv4 } from "uuid";
import { PracticeRepository } from "../../repositories/PracticeRepository.js";
import { ConceptRepository } from "../../repositories/ConceptRepository.js";
import { AnalogyRepository } from "../../repositories/AnalogyRepository.js";
import { AIOrchestrator } from "../ai/orchestrator.js";
import { PromptManager } from "../../prompts/PromptManager.js";
import type { PracticeAttempt } from "../../models/index.js";

export type PracticeMode = "create_analogy" | "matching" | "reflection" | "misconception_check";

export interface PracticeChallenge {
  mode: PracticeMode;
  conceptId: string;
  prompt: string;
  expectedConcepts?: string[];
}

export class PracticeEngine {
  private practiceRepo = new PracticeRepository();
  private conceptRepo = new ConceptRepository();
  private analogyRepo = new AnalogyRepository();
  private aiOrchestrator: AIOrchestrator;
  private promptManager: PromptManager;

  constructor(aiOrchestrator?: AIOrchestrator, promptManager?: PromptManager) {
    this.aiOrchestrator = aiOrchestrator || new AIOrchestrator();
    this.promptManager = promptManager || new PromptManager();
  }

  async generateChallenge(conceptId: string, mode: PracticeMode): Promise<PracticeChallenge> {
    const concept = await this.conceptRepo.findById(conceptId);
    if (!concept) throw new Error("Concept not found");

    switch (mode) {
      case "create_analogy":
        return {
          mode,
          conceptId,
          prompt: `Create an original analogy to explain "${concept.title}" to someone unfamiliar with it.`,
          expectedConcepts: [concept.title, concept.category || ""],
        };

      case "matching":
        const analogies = await this.analogyRepo.findByConcept(conceptId, 5);
        const targetAnalogy = analogies.data[0];
        return {
          mode,
          conceptId,
          prompt: targetAnalogy
            ? `Review this analogy for "${concept.title}":\n\n${targetAnalogy.content}\n\nIdentify which elements of the analogy correctly map to the concept and which do not.`
            : `Explain the key components of "${concept.title}" and how they relate to each other.`,
          expectedConcepts: [concept.title],
        };

      case "reflection":
        return {
          mode,
          conceptId,
          prompt: `Reflect on "${concept.title}". How does it connect to things you already know? What questions do you still have?`,
          expectedConcepts: [concept.title],
        };

      case "misconception_check":
        return {
          mode,
          conceptId,
          prompt: `Is the following statement true or false? Explain your reasoning.\n\n"${concept.definition}"`,
          expectedConcepts: [concept.title],
        };

      default:
        throw new Error("Unsupported practice mode: " + mode);
    }
  }

  async evaluateSubmission(
    userId: string,
    conceptId: string,
    mode: PracticeMode,
    userAnswer: string
  ): Promise<PracticeAttempt> {
    const concept = await this.conceptRepo.findById(conceptId);
    if (!concept) throw new Error("Concept not found");

    const prompt = this.promptManager.getEvaluateAnalogyPrompt({
      concept: concept.title,
      analogy: userAnswer,
      expectedConcepts: [concept.title, concept.category || ""],
    });

    const aiResponse = await this.aiOrchestrator.complete("EvaluateAnalogy", {
      concept: concept.title,
      analogy: userAnswer,
    });

    const parsed = this.parseEvaluationResponse(aiResponse.content);

    const attempt = await this.practiceRepo.create({
      userId,
      mode,
      conceptId,
      userAnswer,
      feedback: { raw: aiResponse.content },
      score: parsed.understandingScore,
      strengths: parsed.strengths,
      weaknesses: parsed.weaknesses,
      misconceptions: parsed.misconceptions,
      suggestions: parsed.suggestions,
    });

    return attempt;
  }

  private parseEvaluationResponse(content: string): {
    strengths: string[];
    weaknesses: string[];
    misconceptions: string[];
    suggestions: string[];
    understandingScore: number;
  } {
    const lines = content.split("\n").filter((l) => l.trim());
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const misconceptions: string[] = [];
    const suggestions: string[] = [];
    let understandingScore = 0.5;

    let section: "strengths" | "weaknesses" | "misconceptions" | "suggestions" | "score" | null = null;

    for (const line of lines) {
      const lower = line.toLowerCase().trim();
      if (lower.startsWith("strengths")) { section = "strengths"; continue; }
      if (lower.startsWith("weaknesses")) { section = "weaknesses"; continue; }
      if (lower.startsWith("misconceptions")) { section = "misconceptions"; continue; }
      if (lower.startsWith("suggestions")) { section = "suggestions"; continue; }
      if (lower.startsWith("understanding_score")) { section = "score"; continue; }

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
      }
    }

    return { strengths, weaknesses, misconceptions, suggestions, understandingScore };
  }
}
