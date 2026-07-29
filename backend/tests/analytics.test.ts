import { describe, it, expect, beforeEach } from "vitest";
import { AnalyticsService } from "../src/services/analytics/service.js";
import { SessionRepository } from "../src/repositories/SessionRepository.js";
import { PracticeRepository } from "../src/repositories/PracticeRepository.js";
import { UserRepository } from "../src/repositories/UserRepository.js";

describe("AnalyticsService", () => {
  let service: AnalyticsService;
  let userRepo: UserRepository;
  let sessionRepo: SessionRepository;
  let practiceRepo: PracticeRepository;
  let userId: string;

  beforeEach(async () => {
    service = new AnalyticsService();
    userRepo = new UserRepository();
    sessionRepo = new SessionRepository();
    practiceRepo = new PracticeRepository();

    const user = await userRepo.create({
      email: "analytics@test.com",
      passwordHash: "hash",
      name: "Analytics User",
      role: "student",
      preferences: {},
    });
    userId = user.id;
  });

  it("should return stats for new user", async () => {
    const stats = await service.getUserStats(userId);
    expect(stats.totalSessions).toBe(0);
    expect(stats.totalDurationMinutes).toBe(0);
    expect(stats.conceptsCovered).toBe(0);
    expect(stats.averageSessionDuration).toBe(0);
    expect(stats.completionRate).toBe(0);
    expect(stats.streakDays).toBe(0);
    expect(stats.weeklyActivity).toHaveLength(7);
    expect(stats.topicMastery).toHaveLength(0);
    expect(stats.commonMisconceptions).toHaveLength(0);
    expect(stats.practiceFrequency).toHaveLength(7);
  });

  it("should calculate practice frequency", async () => {
    const concept = {
      id: "test-concept",
      title: "Test Concept",
      definition: "Test",
      category: "Test",
      difficulty: "beginner" as const,
    };

    await practiceRepo.create({
      userId,
      mode: "assessment",
      conceptId: concept.id,
      userAnswer: "answer",
      score: 0.8,
      strengths: [],
      weaknesses: [],
      misconceptions: [],
      suggestions: [],
    });

    const stats = await service.getUserStats(userId);
    const today = new Date().toISOString().split("T")[0];
    const todayFreq = stats.practiceFrequency.find((f) => f.date === today);
    expect(todayFreq?.count).toBe(1);
  });

  it("should get concept-specific stats", async () => {
    const concept = {
      id: "specific-concept",
      title: "Specific Concept",
      definition: "Specific",
      category: "Test",
      difficulty: "beginner" as const,
    };

    await practiceRepo.create({
      userId,
      mode: "assessment",
      conceptId: concept.id,
      userAnswer: "answer",
      score: 0.7,
      strengths: ["strength"],
      weaknesses: ["weakness"],
      misconceptions: ["misconception"],
      suggestions: ["suggestion"],
    });

    const stats = await service.getConceptStats(userId, concept.id);
    expect(stats.conceptId).toBe(concept.id);
    expect(stats.attempts).toBe(1);
    expect(stats.averageScore).toBeCloseTo(0.7, 1);
    expect(stats.strengths).toContain("strength");
    expect(stats.weaknesses).toContain("weakness");
    expect(stats.misconceptions).toContain("misconception");
  });
});
