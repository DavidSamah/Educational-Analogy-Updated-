import { env } from "../../config/env.js";
import { PromptManager } from "../../prompts/PromptManager.js";
import { logger } from "../../utils/logger.js";

export interface AIResponse {
  content: string;
  model: string;
  tokensUsed?: number;
  cached?: boolean;
}

export interface AIOrchestratorOptions {
  model?: string;
  fallbackModel?: string;
  temperature?: number;
  maxRetries?: number;
  cacheTtlMs?: number;
}

interface CacheEntry {
  response: AIResponse;
  expiresAt: number;
}

export class AIOrchestrator {
  private promptManager: PromptManager;
  private cache = new Map<string, CacheEntry>();
  private activeRequests = 0;
  private readonly maxConcurrent = 3;

  constructor(promptManager?: PromptManager) {
    this.promptManager = promptManager || new PromptManager();
  }

  async complete(
    promptName: string,
    params: Record<string, unknown>,
    options: AIOrchestratorOptions = {}
  ): Promise<AIResponse> {
    const {
      model = env.OPENROUTER_MODEL,
      fallbackModel = "openai/gpt-4o-mini",
      temperature = 0.7,
      maxRetries = 2,
      cacheTtlMs = 5 * 60 * 1000,
    } = options;

    const cacheKey = `${promptName}:${JSON.stringify(params)}:${model}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      logger.debug("AI cache hit", { promptName, model });
      return { ...cached, cached: true };
    }

    const prompt = (this.promptManager as any)[`get${promptName}Prompt`]?.(params);
    if (!prompt) {
      throw new Error(`Unknown prompt: ${promptName}`);
    }

    const response = await this.executeWithRetry(prompt, model, fallbackModel, maxRetries, temperature);
    this.setCache(cacheKey, response, cacheTtlMs);

    logger.info("AI request completed", { promptName, model, cached: false });
    return response;
  }

  private async executeWithRetry(
    prompt: { system: string; user: string },
    primaryModel: string,
    fallbackModel: string,
    maxRetries: number,
    temperature: number
  ): Promise<AIResponse> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const modelToUse = attempt === maxRetries ? fallbackModel : primaryModel;

      try {
        return await this.callAI(prompt, modelToUse, temperature);
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        logger.warn("AI request failed", {
          attempt,
          model: modelToUse,
          error: lastError.message,
        });

        if (attempt === maxRetries) break;
        await this.sleep(Math.pow(2, attempt) * 1000);
      }
    }

    throw new Error(`AI service failed after ${maxRetries + 1} attempts: ${lastError?.message}`);
  }

  private async callAI(
    prompt: { system: string; user: string },
    model: string,
    temperature: number
  ): Promise<AIResponse> {
    await this.acquireSlot();

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          temperature,
          messages: [
            { role: "system", content: prompt.system },
            { role: "user", content: prompt.user },
          ],
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`AI service error ${response.status}: ${text}`);
      }

      const data = await response.json();

      if (!data.choices?.[0]?.message?.content) {
        throw new Error("AI service returned empty response");
      }

      return {
        content: data.choices[0].message.content,
        model,
        tokensUsed: data.usage?.total_tokens,
      };
    } finally {
      this.releaseSlot();
    }
  }

  private async acquireSlot(): Promise<void> {
    while (this.activeRequests >= this.maxConcurrent) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    this.activeRequests++;
  }

  private releaseSlot(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
  }

  private getFromCache(key: string): AIResponse | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.response;
  }

  private setCache(key: string, response: AIResponse, ttlMs: number): void {
    this.cache.set(key, {
      response,
      expiresAt: Date.now() + ttlMs,
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const aiOrchestrator = new AIOrchestrator();