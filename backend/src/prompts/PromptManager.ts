import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROMPTS_DIR = join(__dirname, "prompts");

type PromptTemplate = { system: string; user: string };

function loadPrompt(name: string): PromptTemplate {
  const raw = readFileSync(join(PROMPTS_DIR, name + ".txt"), "utf-8");
  const lines = raw.split("\n");
  const systemLines: string[] = [];
  const userLines: string[] = [];
  let mode: "system" | "user" = "system";

  for (const line of lines) {
    if (line.trim().startsWith("---USER---")) {
      mode = "user";
      continue;
    }
    if (mode === "system") {
      systemLines.push(line);
    } else {
      userLines.push(line);
    }
  }

  return {
    system: systemLines.join("\n").trim(),
    user: userLines.join("\n").trim(),
  };
}

export class PromptManager {
  private cache = new Map<string, PromptTemplate>();

  private getPrompt(name: string): PromptTemplate {
    if (!this.cache.has(name)) {
      this.cache.set(name, loadPrompt(name));
    }
    return this.cache.get(name)!;
  }

  getGenerateAnalogyPrompt(params: { concept: string; perspective: string; difficulty: string; style: string }): PromptTemplate {
    const template = this.getPrompt("generateAnalogy");
    return {
      system: template.system,
      user: template.user + "\n\nConcept: " + params.concept + "\nPerspective: " + params.perspective + "\nDifficulty: " + params.difficulty + "\nStyle: " + params.style,
    };
  }

  getEvaluateAnalogyPrompt(params: { concept: string; analogy: string; expectedConcepts?: string[] }): PromptTemplate {
    const template = this.getPrompt("evaluateAnalogy");
    return {
      system: template.system,
      user: template.user + "\n\nConcept: " + params.concept + "\nAnalogy: " + params.analogy + "\nExpected concepts: " + (params.expectedConcepts?.join(", ") || "N/A"),
    };
  }

  getGenerateLearningPathPrompt(params: { userId: string; knownConcepts: string[]; goal: string }): PromptTemplate {
    const template = this.getPrompt("generateLearningPath");
    return {
      system: template.system,
      user: template.user + "\n\nUser ID: " + params.userId + "\nAlready known: " + params.knownConcepts.join(", ") + "\nLearning goal: " + params.goal,
    };
  }

  getDetectMisconceptionsPrompt(params: { userAnswer: string; concept: string; correctAnswer: string }): PromptTemplate {
    const template = this.getPrompt("detectMisconceptions");
    return {
      system: template.system,
      user: template.user + "\n\nConcept: " + params.concept + "\nUser answer: " + params.userAnswer + "\nCorrect answer: " + params.correctAnswer,
    };
  }

  getRecommendNextTopicPrompt(params: { userId: string; lastTopic: string; history: string[] }): PromptTemplate {
    const template = this.getPrompt("recommendNextTopic");
    return {
      system: template.system,
      user: template.user + "\n\nUser ID: " + params.userId + "\nLast topic: " + params.lastTopic + "\nHistory: " + params.history.join(", "),
    };
  }

  getSummariseConceptPrompt(params: { concept: string; level: string }): PromptTemplate {
    const template = this.getPrompt("summariseConcept");
    return {
      system: template.system,
      user: template.user + "\n\nConcept: " + params.concept + "\nLevel: " + params.level,
    };
  }

  getRegeneratePrompt(analogy: { content: string }) {
    const template = this.getPrompt("regenerate");
    return {
      system: template.system,
      user: template.user.replace("{analogy}", analogy.content),
    };
  }

  getSimplifyPrompt(analogy: { content: string }) {
    const template = this.getPrompt("simplify");
    return {
      system: template.system,
      user: template.user.replace("{analogy}", analogy.content),
    };
  }

  getExpandPrompt(analogy: { content: string }) {
    const template = this.getPrompt("expand");
    return {
      system: template.system,
      user: template.user.replace("{analogy}", analogy.content),
    };
  }
}

export default PromptManager;
