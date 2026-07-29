import { v4 as uuidv4 } from "uuid";
import { getDatabase } from "../config/database.js";
import type { LearningPath, LearningStage } from "../models/index.js";

export class LearningPathRepository {
  private dbPromise = getDatabase();

  async create(data: Omit<LearningPath, "id" | "createdAt" | "updatedAt">): Promise<LearningPath> {
    const db = await this.dbPromise;
    const id = uuidv4();
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO learning_paths (id, user_id, title, stages, current_stage, completed_concepts, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, data.userId, data.title, JSON.stringify(data.stages), data.currentStage, JSON.stringify(data.completedConcepts), now, now);
    return (await this.findById(id))!;
  }

  async findById(id: string): Promise<LearningPath | undefined> {
    const db = await this.dbPromise;
    const stmt = db.prepare("SELECT * FROM learning_paths WHERE id = ?");
    return this.mapRow(stmt.get(id));
  }

  async findByUser(userId: string): Promise<LearningPath[]> {
    const db = await this.dbPromise;
    const stmt = db.prepare("SELECT * FROM learning_paths WHERE user_id = ? ORDER BY updated_at DESC");
    const rows = stmt.all(userId) as any[];
    return rows.map(this.mapRow).filter((lp): lp is LearningPath => lp !== undefined);
  }

  async update(id: string, data: Partial<Omit<LearningPath, "id" | "userId" | "createdAt">>): Promise<LearningPath | undefined> {
    const db = await this.dbPromise;
    const existing = await this.findById(id);
    if (!existing) return undefined;
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      UPDATE learning_paths SET title = COALESCE(?, title), stages = COALESCE(?, stages),
      current_stage = COALESCE(?, current_stage), completed_concepts = COALESCE(?, completed_concepts), updated_at = ? WHERE id = ?
    `);
    stmt.run(data.title ?? existing.title, data.stages ? JSON.stringify(data.stages) : undefined, data.currentStage ?? existing.currentStage, data.completedConcepts ? JSON.stringify(data.completedConcepts) : undefined, now, id);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const db = await this.dbPromise;
    const stmt = db.prepare("DELETE FROM learning_paths WHERE id = ?");
    return stmt.run(id).changes > 0;
  }

  private mapRow(row: any): LearningPath | undefined {
    if (!row) return undefined;
    return {
      ...row,
      stages: typeof row.stages === "string" ? JSON.parse(row.stages) : row.stages,
      completedConcepts: typeof row.completed_concepts === "string" ? JSON.parse(row.completed_concepts) : row.completed_concepts,
    };
  }
}
