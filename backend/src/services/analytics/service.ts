import { SessionRepository } from "../../repositories/SessionRepository.js";
import { PracticeRepository } from "../../repositories/PracticeRepository.js";
import { ConceptRepository } from "../../repositories/ConceptRepository.js";
import { LearningPathRepository } from "../../repositories/LearningPathRepository.js";

export interface LearningStats {
  totalSessions: number;
  totalDurationMinutes: number;
  conceptsCovered: number;
  averageSessionDuration: number;
  completionRate: number;
  streakDays: number;
  weeklyActivity: { day: string; minutes: number }[];
  topicMastery: { conceptId: string; title: string; mastery: number }[];
  commonMisconceptions: string[];
  practiceFrequency: { date: string; count: number }[];
}

export class AnalyticsService {
  private sessionRepo = new SessionRepository();
  private practiceRepo = new PracticeRepository();
  private conceptRepo = new ConceptRepository();
  private learningPathRepo = new LearningPathRepository();

  async getUserStats(userId: string): Promise<LearningStats> {
    const sessionStats = await this.sessionRepo.getStats(userId);
    const sessions = await this.sessionRepo.findByUser(userId, 200);
    const practices = await this.practiceRepo.findByUser(userId, 200);
    const paths = await this.learningPathRepo.findByUser(userId);

    const conceptScores = new Map<string, { total: number; count: number }>();
    for (const attempt of practices.data) {
      if (!attempt.conceptId) continue;
      const current = conceptScores.get(attempt.conceptId) || { total: 0, count: 0 };
      conceptScores.set(attempt.conceptId, { total: current.total + attempt.score, count: current.count + 1 });
    }

    const topicMastery = Array.from(conceptScores.entries())
      .map(([conceptId, { total, count }]) => ({
        conceptId,
        title: conceptId,
        mastery: total / count,
      }))
      .sort((a, b) => b.mastery - a.mastery);

    const misconceptionCounts = new Map<string, number>();
    for (const attempt of practices.data) {
      for (const m of attempt.misconceptions) {
        misconceptionCounts.set(m, (misconceptionCounts.get(m) || 0) + 1);
      }
    }
    const commonMisconceptions = Array.from(misconceptionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([m]) => m);

    const totalStages = paths.reduce((sum, p) => sum + p.stages.length, 0);
    const completedStages = paths.reduce((sum, p) => sum + p.completedConcepts.length, 0);
    const completionRate = totalStages > 0 ? completedStages / totalStages : 0;

    const weeklyActivity = this.computeWeeklyActivity(sessions.data);
    const practiceFrequency = this.computePracticeFrequency(practices.data);
    const streakDays = this.computeStreak(sessions.data);

    return {
      totalSessions: sessionStats.total_sessions,
      totalDurationMinutes: Math.round((sessionStats.total_duration || 0) / 60),
      conceptsCovered: sessionStats.concepts_covered,
      averageSessionDuration: sessionStats.total_sessions > 0
        ? Math.round((sessionStats.total_duration || 0) / sessionStats.total_sessions / 60)
        : 0,
      completionRate,
      streakDays,
      weeklyActivity,
      topicMastery,
      commonMisconceptions,
      practiceFrequency,
    };
  }

  async getConceptStats(userId: string, conceptId: string) {
    const concept = await this.conceptRepo.findById(conceptId);
    const attempts = (await this.practiceRepo.findByUser(userId, 100)).data.filter((a) => a.conceptId === conceptId);

    if (attempts.length === 0) {
      return {
        conceptId,
        title: concept?.title || conceptId,
        attempts: 0,
        averageScore: 0,
        strengths: [],
        weaknesses: [],
        misconceptions: [],
      };
    }

    const totalScore = attempts.reduce((sum, a) => sum + a.score, 0);
    const allStrengths = attempts.flatMap((a) => a.strengths);
    const allWeaknesses = attempts.flatMap((a) => a.weaknesses);
    const allMisconceptions = attempts.flatMap((a) => a.misconceptions);

    return {
      conceptId,
      title: concept?.title || conceptId,
      attempts: attempts.length,
      averageScore: totalScore / attempts.length,
      strengths: [...new Set(allStrengths)],
      weaknesses: [...new Set(allWeaknesses)],
      misconceptions: [...new Set(allMisconceptions)],
    };
  }

  private computeWeeklyActivity(sessions: any[]): { day: string; minutes: number }[] {
    const days: { day: string; minutes: number }[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

      const daySessions = sessions.filter((s) => s.createdAt?.startsWith(dateStr));
      const minutes = daySessions.reduce((sum, s) => sum + (s.duration || 0), 0);

      days.push({ day: dayName, minutes });
    }

    return days;
  }

  private computePracticeFrequency(practices: any[]): { date: string; count: number }[] {
    const frequency = new Map<string, number>();
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      frequency.set(dateStr, 0);
    }

    for (const practice of practices) {
      const dateStr = practice.createdAt?.split("T")[0];
      if (dateStr && frequency.has(dateStr)) {
        frequency.set(dateStr, (frequency.get(dateStr) || 0) + 1);
      }
    }

    return Array.from(frequency.entries()).map(([date, count]) => ({ date, count }));
  }

  private computeStreak(sessions: any[]): number {
    if (sessions.length === 0) return 0;

    const dates = new Set<string>();
    for (const session of sessions) {
      if (session.createdAt) {
        dates.add(session.createdAt.split("T")[0]);
      }
    }

    const sortedDates = Array.from(dates).sort().reverse();
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) return 0;

    let streak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const current = new Date(sortedDates[i - 1]);
      const prev = new Date(sortedDates[i]);
      const diffDays = (current.getTime() - prev.getTime()) / 86400000;

      if (diffDays === 1) streak++;
      else break;
    }

    return streak;
  }
}
