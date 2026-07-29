import { describe, it, expect, beforeEach } from "vitest";
import { LearningPathEngine } from "../src/services/learning/pathEngine.js";
import { ConceptRepository } from "../src/repositories/ConceptRepository.js";
import { PracticeRepository } from "../src/repositories/PracticeRepository.js";
import { UserRepository } from "../src/repositories/UserRepository.js";
import { RelationshipRepository } from "../src/repositories/RelationshipRepository.js";

describe("LearningPathEngine", () => {
  let engine: LearningPathEngine;
  let userRepo: UserRepository;
  let conceptRepo: ConceptRepository;
  let practiceRepo: PracticeRepository;
  let relRepo: RelationshipRepository;
  let userId: string;

  beforeEach(async () => {
    engine = new LearningPathEngine();
    userRepo = new UserRepository();
    conceptRepo = new ConceptRepository();
    practiceRepo = new PracticeRepository();
    relRepo = new RelationshipRepository();

    const user = await userRepo.create({
      email: "learning@test.com",
      passwordHash: "hash",
      name: "Learning User",
      role: "student",
      preferences: {},
    });
    userId = user.id;
  });

  it("should build adaptive path with prerequisites", async () => {
    const advanced = await conceptRepo.create({
      title: "Advanced CS",
      definition: "Advanced topic",
      category: "CS",
      difficulty: "advanced",
    });

    const prereq = await conceptRepo.create({
      title: "Basic CS",
      definition: "Basic topic",
      category: "CS",
      difficulty: "beginner",
    });

    await relRepo.create({
      sourceId: advanced.id,
      targetId: prereq.id,
      type: "requires",
      confidence: 1.0,
      weight: 1.0,
    });

    const path = await engine.buildAdaptivePath(userId, advanced.id);
    expect(path.stages.some((s) => s.key === prereq.id)).toBe(true);
    expect(path.stages.some((s) => s.key === advanced.id)).toBe(true);
  });

  it("should build learner profile from practice history", async () => {
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
      userAnswer: "great answer",
      score: 0.9,
      strengths: ["understands indexing"],
      weaknesses: [],
      misconceptions: [],
      suggestions: [],
    });

    const profile = await engine.buildLearnerProfile(userId);
    expect(profile.strongConcepts).toContain(concept.id);
    expect(profile.completedConcepts).toContain(concept.id);
  });

  it("should estimate mastery time", async () => {
    const concept = await conceptRepo.create({
      title: "Algorithms",
      definition: "Step by step",
      category: "CS",
      difficulty: "advanced",
    });

    const estimate = await engine.estimateMasteryTime(userId, concept.id);
    expect(estimate.estimatedMinutes).toBeGreaterThan(0);
    expect(estimate.confidence).toBeGreaterThan(0);
    expect(estimate.confidence).toBeLessThanOrEqual(1);
  });
});
