import { describe, it, expect, beforeEach } from "vitest";
import { AssessmentEngine } from "../src/services/assessment/engine.js";
import { ConceptRepository } from "../src/repositories/ConceptRepository.js";
import { PracticeRepository } from "../src/repositories/PracticeRepository.js";
import { UserRepository } from "../src/repositories/UserRepository.js";

describe("AssessmentEngine", () => {
  let engine: AssessmentEngine;
  let conceptRepo: ConceptRepository;
  let practiceRepo: PracticeRepository;
  let userRepo: UserRepository;
  let userId: string;

  beforeEach(async () => {
    engine = new AssessmentEngine();
    conceptRepo = new ConceptRepository();
    practiceRepo = new PracticeRepository();
    userRepo = new UserRepository();

    const user = await userRepo.create({
      email: "assess@test.com",
      passwordHash: "hash",
      name: "Assess User",
      role: "student",
      preferences: {},
    });
    userId = user.id;
  });

  it("should assess submission and return result", async () => {
    const concept = await conceptRepo.create({
      title: "Variables",
      definition: "Named storage",
      category: "Programming",
      difficulty: "beginner",
    });

    const result = await engine.assessSubmission(userId, concept.id, "Variables are like containers");
    expect(result.attemptId).toBeDefined();
    expect(result.understandingScore).toBeGreaterThanOrEqual(0);
    expect(result.understandingScore).toBeLessThanOrEqual(1);
    expect(result.nextSteps.length).toBeGreaterThan(0);
  });

  it("should return progress summary", async () => {
    const summary = await engine.getProgressSummary(userId);
    expect(summary.totalAttempts).toBe(0);
    expect(summary.averageScore).toBe(0);
  });

  it("should aggregate progress by concept", async () => {
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
      userAnswer: "answer",
      score: 0.7,
      strengths: ["good"],
      weaknesses: ["incomplete"],
      misconceptions: ["indexing"],
      suggestions: ["review"],
    });

    const summary = await engine.getProgressSummary(userId, concept.id);
    expect(summary.totalAttempts).toBe(1);
    expect(summary.averageScore).toBeCloseTo(0.7, 1);
  });
});
