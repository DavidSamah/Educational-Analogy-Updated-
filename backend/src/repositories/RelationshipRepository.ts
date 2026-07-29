import { v4 as uuidv4 } from "uuid";
import { getDatabase } from "../config/database.js";
import type { Relationship } from "../models/index.js";

export class RelationshipRepository {
  private dbPromise = getDatabase();

  async create(data: Omit<Relationship, "id" | "createdAt" | "updatedAt">): Promise<Relationship> {
    const db = await this.dbPromise;
    const id = uuidv4();
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO relationships (id, source_id, target_id, type, confidence, source, weight, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, data.sourceId, data.targetId, data.type, data.confidence, data.source || null, data.weight, now, now);
    return (await this.findById(id))!;
  }

  async findById(id: string): Promise<Relationship | undefined> {
    const db = await this.dbPromise;
    const stmt = db.prepare("SELECT * FROM relationships WHERE id = ?");
    return this.mapRow(stmt.get(id));
  }

  async findByConcept(conceptId: string): Promise<Relationship[]> {
    const db = await this.dbPromise;
    const stmt = db.prepare("SELECT * FROM relationships WHERE source_id = ? OR target_id = ?");
    const rows = stmt.all(conceptId, conceptId) as any[];
    return rows.map(this.mapRow).filter((r): r is Relationship => r !== undefined);
  }

  async findBySource(sourceId: string): Promise<Relationship[]> {
    const db = await this.dbPromise;
    const stmt = db.prepare("SELECT * FROM relationships WHERE source_id = ?");
    const rows = stmt.all(sourceId) as any[];
    return rows.map(this.mapRow).filter((r): r is Relationship => r !== undefined);
  }

  async findByTarget(targetId: string): Promise<Relationship[]> {
    const db = await this.dbPromise;
    const stmt = db.prepare("SELECT * FROM relationships WHERE target_id = ?");
    const rows = stmt.all(targetId) as any[];
    return rows.map(this.mapRow).filter((r): r is Relationship => r !== undefined);
  }

  async findAll(limit = 100, offset = 0): Promise<{ data: Relationship[]; total: number }> {
    const db = await this.dbPromise;
    const countStmt = db.prepare("SELECT COUNT(*) as count FROM relationships");
    const total = (await countStmt.get())?.count ?? 0;
    const stmt = db.prepare("SELECT * FROM relationships LIMIT ? OFFSET ?");
    const rows = stmt.all(limit, offset) as any[];
    return { data: rows.map(this.mapRow).filter((r): r is Relationship => r !== undefined), total };
  }

  async delete(id: string): Promise<boolean> {
    const db = await this.dbPromise;
    const stmt = db.prepare("DELETE FROM relationships WHERE id = ?");
    return stmt.run(id).changes > 0;
  }

  async deleteByConcept(conceptId: string): Promise<boolean> {
    const db = await this.dbPromise;
    const stmt = db.prepare("DELETE FROM relationships WHERE source_id = ? OR target_id = ?");
    return stmt.run(conceptId, conceptId).changes > 0;
  }

  private mapRow(row: any): Relationship | undefined {
    if (!row) return undefined;
    return { ...row };
  }
}
