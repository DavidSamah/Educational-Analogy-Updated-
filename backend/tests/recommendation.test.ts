import { describe, it, expect, beforeEach } from "vitest";
import { RecommendationEngine } from "../src/services/recommendation/engine.js";
import { ConceptRepository } from "../src/repositories/ConceptRepository.js";
import { PracticeRepository } from "../src/repositories/PracticeRepository.js";
import { LearningPathRepository } from "../src/repositories/LearningPathRepository.js";
import { RelationshipRepository } from "../src/repositories/RelationshipRepository.js";
import { UserRepository } from "../src/repositories/UserRepository.js";

describe("RecommendationEngine", () => {
  let engine: RecommendationEngine;
  let userRepo: UserRepository;
  let conceptRepo: ConceptRepository;
  let practiceRepo: PracticeRepository;
  let learningPathRepo: LearningPathRepository;
  let relRepo: RelationshipRepository;
  let userId: string;

  beforeEach(async () => {
    engine = new RecommendationEngine();
    userRepo = new UserRepository();
    conceptRepo = new ConceptRepository();
    practiceRepo = new PracticeRepository();
    learningPathRepo = new LearningPathRepository();
    relRepo = new RelationshipRepository();

    const user = await userRepo.create({
      email: "recommend@test.com",
      passwordHash: "hash",
      name: "Recommend User",
      role: "student",
      preferences: {},
    });
    userId = user.id;
  });

  it("should recommend weak concepts for practice", async () => {
    const concept = await conceptRepo.create({
      title: "Arrays",
      definition: "Data structure",
      category: "CS",
      difficulty: "beginner",
    });

    await practiceRepo.create({
      userId,
      mode: "assessment",
      conceptId: concept.id,
      userAnswer: "partial answer",
      score: 0.3,
      strengths: [],
      weaknesses: ["incomplete"],
      misconceptions: ["array starts at 1"],
      suggestions: ["review indexing"],
    });

    const recommendations = await engine.recommendForUser(userId, 5);
    expect(recommendations.some((r) => r.type === "practice" && r.id === concept.id)).toBe(true);
  });

  it("should suggest learning path when none exists", async () => {
    const concept = await conceptRepo.create({
      title: "Variables",
      definition: "Storage locations",
      category: "CS",
      difficulty: "beginner",
    });

    const recommendations = await engine.recommendForUser(userId, 5);
    expect(recommendations.some((r) => r.type === "concept")).toBe(true);
  });

  it("should find knowledge gaps from practice history", async () => {
    const concept = await conceptRepo.create({
      title: "Loops",
      definition: "Repetition",
      category: "CS",
      difficulty: "beginner",
    });

    for (let i = 0; i < 3; i++) {
      await practiceRepo.create({
        userId,
        mode: "assessment",
        conceptId: concept.id,
        userAnswer: "answer",
        score: 0.4,
        strengths: [],
        weaknesses: ["loop condition"],
        misconceptions: ["infinite loop always bad"],
        suggestions: ["practice more"],
      });
    }

    const gaps = await engine.findKnowledgeGaps(userId);
    expect(gaps.some((g) => g.id === concept.id)).toBe(true);
  });
});
