import { v4 as uuidv4 } from "uuid";
import { getDatabase } from "../config/database.js";
import type { Analogy } from "../models/index.js";

export class AnalogyRepository {
  private dbPromise = getDatabase();

  async create(data: Omit<Analogy, "id" | "createdAt">): Promise<Analogy> {
    const db = await this.dbPromise;
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO analogies (id, concept_id, user_id, content, style, difficulty, perspective, mapping, explanation, limitations, misconceptions, confidence_score, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    stmt.run(id, data.conceptId, data.userId || null, data.content, data.style, data.difficulty, data.perspective || null, JSON.stringify(data.mapping), data.explanation || null, data.limitations || null, JSON.stringify(data.misconceptions), data.confidenceScore);
    return (await this.findById(id))!;
  }

  async findById(id: string): Promise<Analogy | undefined> {
    const db = await this.dbPromise;
    const stmt = db.prepare("SELECT * FROM analogies WHERE id = ?");
    return this.mapRow(stmt.get(id));
  }

  async findByConcept(conceptId: string, limit = 20, offset = 0): Promise<{ data: Analogy[]; total: number }> {
    const db = await this.dbPromise;
    const countStmt = db.prepare("SELECT COUNT(*) as count FROM analogies WHERE concept_id = ?");
    const total = (await countStmt.get(conceptId))?.count ?? 0;
    const stmt = db.prepare("SELECT * FROM analogies WHERE concept_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?");
    const rows = stmt.all(conceptId, limit, offset) as any[];
    return { data: rows.map(this.mapRow).filter((a): a is Analogy => a !== undefined), total };
  }

  async findByUser(userId: string, limit = 20, offset = 0): Promise<{ data: Analogy[]; total: number }> {
    const db = await this.dbPromise;
    const countStmt = db.prepare("SELECT COUNT(*) as count FROM analogies WHERE user_id = ?");
    const total = (await countStmt.get(userId))?.count ?? 0;
    const stmt = db.prepare("SELECT * FROM analogies WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?");
    const rows = stmt.all(userId, limit, offset) as any[];
    return { data: rows.map(this.mapRow).filter((a): a is Analogy => a !== undefined), total };
  }

  async update(id: string, data: Partial<Omit<Analogy, "id" | "conceptId" | "userId" | "createdAt">>): Promise<Analogy | undefined> {
    const db = await this.dbPromise;
    const existing = await this.findById(id);
    if (!existing) return undefined;
    const stmt = db.prepare(`
      UPDATE analogies SET content = COALESCE(?, content), style = COALESCE(?, style), difficulty = COALESCE(?, difficulty),
      perspective = COALESCE(?, perspective), mapping = COALESCE(?, mapping), explanation = COALESCE(?, explanation),
      limitations = COALESCE(?, limitations), misconceptions = COALESCE(?, misconceptions), confidence_score = COALESCE(?, confidence_score)
      WHERE id = ?
    `);
    stmt.run(data.content ?? existing.content, data.style ?? existing.style, data.difficulty ?? existing.difficulty, data.perspective ?? existing.perspective, data.mapping ? JSON.stringify(data.mapping) : undefined, data.explanation ?? existing.explanation, data.limitations ?? existing.limitations, data.misconceptions ? JSON.stringify(data.misconceptions) : undefined, data.confidenceScore ?? existing.confidenceScore, id);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const db = await this.dbPromise;
    const stmt = db.prepare("DELETE FROM analogies WHERE id = ?");
    return stmt.run(id).changes > 0;
  }

  private mapRow(row: any): Analogy | undefined {
    if (!row) return undefined;
    return {
      ...row,
      mapping: typeof row.mapping === "string" ? JSON.parse(row.mapping) : row.mapping,
      misconceptions: typeof row.misconceptions === "string" ? JSON.parse(row.misconceptions) : row.misconceptions,
    };
  }
}
