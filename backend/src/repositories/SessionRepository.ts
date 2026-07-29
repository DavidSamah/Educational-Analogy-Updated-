import { v4 as uuidv4 } from "uuid";
import { getDatabase } from "../config/database.js";
import type { LearningSession } from "../models/index.js";

export class SessionRepository {
  private dbPromise = getDatabase();

  async create(data: Omit<LearningSession, "id" | "createdAt">): Promise<LearningSession> {
    const db = await this.dbPromise;
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO learning_sessions (id, user_id, concept_id, duration, activities, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);
    stmt.run(id, data.userId, data.conceptId || null, data.duration, JSON.stringify(data.activities));
    return (await this.findById(id))!;
  }

  async findById(id: string): Promise<LearningSession | undefined> {
    const db = await this.dbPromise;
    const stmt = db.prepare("SELECT * FROM learning_sessions WHERE id = ?");
    return this.mapRow(stmt.get(id));
  }

  async findByUser(userId: string, limit = 50, offset = 0): Promise<{ data: LearningSession[]; total: number }> {
    const db = await this.dbPromise;
    const countStmt = db.prepare("SELECT COUNT(*) as count FROM learning_sessions WHERE user_id = ?");
    const total = (await countStmt.get(userId))?.count ?? 0;
    const stmt = db.prepare("SELECT * FROM learning_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?");
    const rows = stmt.all(userId, limit, offset) as any[];
    return { data: rows.map(this.mapRow).filter((s): s is LearningSession => s !== undefined), total };
  }

  async getStats(userId: string) {
    const db = await this.dbPromise;
    const stmt = db.prepare(`
      SELECT COUNT(*) as total_sessions, SUM(duration) as total_duration, COUNT(DISTINCT concept_id) as concepts_covered
      FROM learning_sessions WHERE user_id = ?
    `);
    return stmt.get(userId) as { total_sessions: number; total_duration: number; concepts_covered: number };
  }

  private mapRow(row: any): LearningSession | undefined {
    if (!row) return undefined;
    return {
      ...row,
      activities: typeof row.activities === "string" ? JSON.parse(row.activities) : row.activities,
    };
  }
}
