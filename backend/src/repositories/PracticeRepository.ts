import { v4 as uuidv4 } from "uuid";
import { getDatabase } from "../config/database.js";
import type { PracticeAttempt } from "../models/index.js";

export class PracticeRepository {
  private dbPromise = getDatabase();

  async create(data: Omit<PracticeAttempt, "id" | "createdAt">): Promise<PracticeAttempt> {
    const db = await this.dbPromise;
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO practice_attempts (id, user_id, mode, concept_id, user_answer, feedback, score, strengths, weaknesses, misconceptions, suggestions, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    stmt.run(id, data.userId, data.mode, data.conceptId || null, data.userAnswer, JSON.stringify(data.feedback), data.score, JSON.stringify(data.strengths), JSON.stringify(data.weaknesses), JSON.stringify(data.misconceptions), JSON.stringify(data.suggestions));
    return (await this.findById(id))!;
  }

  async findById(id: string): Promise<PracticeAttempt | undefined> {
    const db = await this.dbPromise;
    const stmt = db.prepare("SELECT * FROM practice_attempts WHERE id = ?");
    return this.mapRow(stmt.get(id));
  }

  async findByUser(userId: string, limit = 20, offset = 0): Promise<{ data: PracticeAttempt[]; total: number }> {
    const db = await this.dbPromise;
    const countStmt = db.prepare("SELECT COUNT(*) as count FROM practice_attempts WHERE user_id = ?");
    const total = (await countStmt.get(userId))?.count ?? 0;
    const stmt = db.prepare("SELECT * FROM practice_attempts WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?");
    const rows = stmt.all(userId, limit, offset) as any[];
    return { data: rows.map(this.mapRow).filter((p): p is PracticeAttempt => p !== undefined), total };
  }

  async findByConcept(conceptId: string, limit = 20, offset = 0): Promise<{ data: PracticeAttempt[]; total: number }> {
    const db = await this.dbPromise;
    const countStmt = db.prepare("SELECT COUNT(*) as count FROM practice_attempts WHERE concept_id = ?");
    const total = (await countStmt.get(conceptId))?.count ?? 0;
    const stmt = db.prepare("SELECT * FROM practice_attempts WHERE concept_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?");
    const rows = stmt.all(conceptId, limit, offset) as any[];
    return { data: rows.map(this.mapRow).filter((p): p is PracticeAttempt => p !== undefined), total };
  }

  private mapRow(row: any): PracticeAttempt | undefined {
    if (!row) return undefined;
    return {
      ...row,
      feedback: typeof row.feedback === "string" ? JSON.parse(row.feedback) : row.feedback,
      strengths: typeof row.strengths === "string" ? JSON.parse(row.strengths) : row.strengths,
      weaknesses: typeof row.weaknesses === "string" ? JSON.parse(row.weaknesses) : row.weaknesses,
      misconceptions: typeof row.misconceptions === "string" ? JSON.parse(row.misconceptions) : row.misconceptions,
      suggestions: typeof row.suggestions === "string" ? JSON.parse(row.suggestions) : row.suggestions,
    };
  }
}
