import { AnalogyRepository } from "../../repositories/AnalogyRepository.js";
import { ConceptRepository } from "../../repositories/ConceptRepository.js";
import { PromptManager } from "../../prompts/PromptManager.js";
import { env } from "../../config/env.js";
import { z } from "zod";

const GenerateAnalogySchema = z.object({
  conceptId: z.string().optional(),
  concept: z.string().optional(),
  perspective: z.string().default("Programming"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
  style: z.string().default("technology"),
});

export class AnalogyEngine {
  private repo = new AnalogyRepository();
  private conceptRepo = new ConceptRepository();
  private promptManager = new PromptManager();

  async generate(data: unknown) {
    const parsed = GenerateAnalogySchema.parse(data);
    let conceptId = parsed.conceptId;
    let conceptTitle = parsed.concept;

    if (!conceptId && conceptTitle) {
      const found = this.conceptRepo.findByTitle(conceptTitle);
      if (found) conceptId = found.id;
    }

    const prompt = this.promptManager.getGenerateAnalogyPrompt({
      concept: conceptTitle || conceptId || "unknown",
      perspective: parsed.perspective,
      difficulty: parsed.difficulty,
      style: parsed.style,
    });

    const aiResponse = await this.callAI(prompt);

    const parsedResponse = this.parseAnalogyResponse(aiResponse);

    const analogy = this.repo.create({
      conceptId: conceptId || "",
      content: parsedResponse.content,
      style: parsed.style,
      difficulty: parsed.difficulty,
      perspective: parsed.perspective,
      mapping: parsedResponse.mapping,
      explanation: parsedResponse.explanation,
      limitations: parsedResponse.limitations,
      misconceptions: parsedResponse.misconceptions,
      confidenceScore: parsedResponse.confidenceScore,
    });

    return analogy;
  }

  findById(id: string) {
    const analogy = this.repo.findById(id);
    if (!analogy) throw new Error("Analogy not found");
    return analogy;
  }

  findByConcept(conceptId: string, limit = 20, offset = 0) {
    return this.repo.findByConcept(conceptId, limit, offset);
  }

  async regenerate(id: string) {
    const existing = this.repo.findById(id);
    if (!existing) throw new Error("Analogy not found");

    const prompt = this.promptManager.getRegeneratePrompt(existing);
    const aiResponse = await this.callAI(prompt);
    const parsedResponse = this.parseAnalogyResponse(aiResponse);

    return this.repo.update(id, {
      content: parsedResponse.content,
      mapping: parsedResponse.mapping,
      explanation: parsedResponse.explanation,
      limitations: parsedResponse.limitations,
      misconceptions: parsedResponse.misconceptions,
      confidenceScore: parsedResponse.confidenceScore,
    });
  }

  async simplify(id: string) {
    const existing = this.repo.findById(id);
    if (!existing) throw new Error("Analogy not found");

    const prompt = this.promptManager.getSimplifyPrompt(existing);
    const aiResponse = await this.callAI(prompt);
    const parsedResponse = this.parseAnalogyResponse(aiResponse);

    return this.repo.update(id, {
      content: parsedResponse.content,
      mapping: parsedResponse.mapping,
      explanation: parsedResponse.explanation,
      confidenceScore: parsedResponse.confidenceScore,
    });
  }

  async expand(id: string) {
    const existing = this.repo.findById(id);
    if (!existing) throw new Error("Analogy not found");

    const prompt = this.promptManager.getExpandPrompt(existing);
    const aiResponse = await this.callAI(prompt);
    const parsedResponse = this.parseAnalogyResponse(aiResponse);

    return this.repo.update(id, {
      content: parsedResponse.content,
      mapping: parsedResponse.mapping,
      explanation: parsedResponse.explanation,
      limitations: parsedResponse.limitations,
      misconceptions: parsedResponse.misconceptions,
      confidenceScore: parsedResponse.confidenceScore,
    });
  }

  private async callAI(prompt: { system: string; user: string }): Promise<string> {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.OPENROUTER_MODEL,
        messages: [
          { role: "system", content: prompt.system },
          { role: "user", content: prompt.user },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content as string;
  }

  private parseAnalogyResponse(content: string): {
    content: string;
    mapping: string[];
    explanation?: string;
    limitations?: string;
    misconceptions: string[];
    confidenceScore: number;
  } {
    const lines = content.split("\n").filter((l) => l.trim());
    const mapping: string[] = [];
    let explanation = "";
    let limitations = "";
    const misconceptions: string[] = [];
    let inMapping = false;
    let inExplanation = false;
    let inLimitations = false;
    let inMisconceptions = false;

    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.includes("mapping") || lower.includes("connection")) {
        inMapping = true;
        inExplanation = false;
        inLimitations = false;
        inMisconceptions = false;
        continue;
      }
      if (lower.includes("explanation")) {
        inExplanation = true;
        inMapping = false;
        inLimitations = false;
        inMisconceptions = false;
        continue;
      }
      if (lower.includes("limitation")) {
        inLimitations = true;
        inMapping = false;
        inExplanation = false;
        inMisconceptions = false;
        continue;
      }
      if (lower.includes("misconception")) {
        inMisconceptions = true;
        inMapping = false;
        inExplanation = false;
        inLimitations = false;
        continue;
      }

      if (inMapping && line.trim().startsWith("-")) {
        mapping.push(line.trim().replace(/^-\s*/, ""));
      } else if (inExplanation && line.trim()) {
        explanation += (explanation ? " " : "") + line.trim();
      } else if (inLimitations && line.trim()) {
        limitations += (limitations ? " " : "") + line.trim();
      } else if (inMisconceptions && line.trim().startsWith("-")) {
        misconceptions.push(line.trim().replace(/^-\s*/, ""));
      }
    }

    return {
      content: lines.join("\n"),
      mapping: mapping.length > 0 ? mapping : ["Concept maps to analogy structure"],
      explanation: explanation || undefined,
      limitations: limitations || undefined,
      misconceptions: misconceptions.length > 0 ? misconceptions : [],
      confidenceScore: 0.75,
    };
  }
}
