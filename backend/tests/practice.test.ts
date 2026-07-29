import { describe, it, expect, beforeEach } from "vitest";
import { PracticeEngine } from "../src/services/practice/engine.js";
import { ConceptRepository } from "../src/repositories/ConceptRepository.js";
import { AnalogyRepository } from "../src/repositories/AnalogyRepository.js";

describe("PracticeEngine", () => {
  let engine: PracticeEngine;
  let conceptRepo: ConceptRepository;
  let analogyRepo: AnalogyRepository;

  beforeEach(() => {
    engine = new PracticeEngine();
    conceptRepo = new ConceptRepository();
    analogyRepo = new AnalogyRepository();
  });

  it("should generate create_analogy challenge", async () => {
    const concept = await conceptRepo.create({
      title: "Functions",
      definition: "Reusable code blocks",
      category: "Programming",
      difficulty: "beginner",
    });

    const challenge = await engine.generateChallenge(concept.id, "create_analogy");
    expect(challenge.mode).toBe("create_analogy");
    expect(challenge.conceptId).toBe(concept.id);
    expect(challenge.prompt).toContain(concept.title);
  });

  it("should generate matching challenge with analogy", async () => {
    const concept = await conceptRepo.create({
      title: "Variables",
      definition: "Named storage",
      category: "Programming",
      difficulty: "beginner",
    });

    await analogyRepo.create({
      conceptId: concept.id,
      content: "Variables are like boxes.",
      style: "technology",
      difficulty: "beginner",
      perspective: "Storage",
      mapping: [],
      misconceptions: [],
      confidenceScore: 0.8,
    });

    const challenge = await engine.generateChallenge(concept.id, "matching");
    expect(challenge.mode).toBe("matching");
    expect(challenge.prompt).toContain(concept.title);
  });

  it("should generate reflection challenge", async () => {
    const concept = await conceptRepo.create({
      title: "Loops",
      definition: "Repetition",
      category: "Programming",
      difficulty: "beginner",
    });

    const challenge = await engine.generateChallenge(concept.id, "reflection");
    expect(challenge.mode).toBe("reflection");
    expect(challenge.prompt).toContain("Reflect");
  });

  it("should throw for unsupported mode", async () => {
    const concept = await conceptRepo.create({
      title: "Test",
      definition: "Test",
      category: "Test",
      difficulty: "beginner",
    });

    await expect(engine.generateChallenge(concept.id, "invalid" as any)).rejects.toThrow();
  });
});
