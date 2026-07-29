import { v4 as uuidv4 } from "uuid";
import { getDatabase } from "../config/database.js";
import type { Concept } from "../models/index.js";

export class ConceptRepository {
  private dbPromise = getDatabase();

  async create(data: Omit<Concept, "id" | "version" | "createdAt" | "updatedAt">): Promise<Concept> {
    const db = await this.dbPromise;
    const id = uuidv4();
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO concepts (id, title, definition, category, difficulty, domain, created_by, version, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `);
    stmt.run(id, data.title, data.definition, data.category || null, data.difficulty, data.domain || null, data.createdBy || null, now, now);
    return (await this.findById(id))!;
  }

  async findById(id: string): Promise<Concept | undefined> {
    const db = await this.dbPromise;
    const stmt = db.prepare("SELECT * FROM concepts WHERE id = ?");
    return this.mapRow(stmt.get(id));
  }

  async findByTitle(title: string): Promise<Concept | undefined> {
    const db = await this.dbPromise;
    const stmt = db.prepare("SELECT * FROM concepts WHERE title = ?");
    return this.mapRow(stmt.get(title));
  }

  async search(query: string, limit = 20, offset = 0): Promise<{ data: Concept[]; total: number }> {
    const db = await this.dbPromise;
    const countStmt = db.prepare("SELECT COUNT(*) as count FROM concepts WHERE title LIKE ? OR definition LIKE ? OR category LIKE ?");
    const total = (await countStmt.get(`%${query}%`, `%${query}%`, `%${query}%`))?.count ?? 0;
    const stmt = db.prepare("SELECT * FROM concepts WHERE title LIKE ? OR definition LIKE ? OR category LIKE ? LIMIT ? OFFSET ?");
    const rows = stmt.all(`%${query}%`, `%${query}%`, `%${query}%`, limit, offset) as any[];
    return { data: rows.map(this.mapRow).filter((c): c is Concept => c !== undefined), total };
  }

  async findAll(limit = 50, offset = 0): Promise<{ data: Concept[]; total: number }> {
    const db = await this.dbPromise;
    const countStmt = db.prepare("SELECT COUNT(*) as count FROM concepts");
    const total = (await countStmt.get())?.count ?? 0;
    const stmt = db.prepare("SELECT * FROM concepts ORDER BY created_at DESC LIMIT ? OFFSET ?");
    const rows = stmt.all(limit, offset) as any[];
    return { data: rows.map(this.mapRow).filter((c): c is Concept => c !== undefined), total };
  }

  async update(id: string, data: Partial<Omit<Concept, "id" | "createdAt">>): Promise<Concept | undefined> {
    const db = await this.dbPromise;
    const existing = await this.findById(id);
    if (!existing) return undefined;
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      UPDATE concepts SET title = COALESCE(?, title), definition = COALESCE(?, definition),
      category = COALESCE(?, category), difficulty = COALESCE(?, difficulty), domain = COALESCE(?, domain),
      version = version + 1, updated_at = ? WHERE id = ?
    `);
    stmt.run(data.title ?? existing.title, data.definition ?? existing.definition, data.category ?? existing.category, data.difficulty ?? existing.difficulty, data.domain ?? existing.domain, now, id);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const db = await this.dbPromise;
    const stmt = db.prepare("DELETE FROM concepts WHERE id = ?");
    return stmt.run(id).changes > 0;
  }

  private mapRow(row: any): Concept | undefined {
    if (!row) return undefined;
    return { ...row };
  }
}
