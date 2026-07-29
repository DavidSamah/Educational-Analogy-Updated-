import { v4 as uuidv4 } from "uuid";
import { getDatabase } from "../config/database.js";
import type { User, PaginationParams, PaginatedResult } from "../models/index.js";

export class UserRepository {
  private dbPromise = getDatabase();

  async create(data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const db = await this.dbPromise;
    const id = uuidv4();
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, preferences, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, data.email, data.passwordHash, data.name, data.role, JSON.stringify(data.preferences || {}), now, now);
    return (await this.findById(id))!;
  }

  async findById(id: string): Promise<User | undefined> {
    const db = await this.dbPromise;
    const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
    return this.mapRow(stmt.get(id));
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const db = await this.dbPromise;
    const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
    return this.mapRow(stmt.get(email));
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<User>> {
    const db = await this.dbPromise;
    const offset = (params.page - 1) * params.limit;
    const countStmt = db.prepare("SELECT COUNT(*) as count FROM users");
    const total = (await countStmt.get())?.count ?? 0;
    const stmt = db.prepare(`SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?`);
    const rows = stmt.all(params.limit, offset) as any[];
    return {
      data: rows.map(this.mapRow).filter((u): u is User => u !== undefined),
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    };
  }

  async update(id: string, data: Partial<Omit<User, "id" | "createdAt">>): Promise<User | undefined> {
    const db = await this.dbPromise;
    const existing = await this.findById(id);
    if (!existing) return undefined;
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      UPDATE users SET email = COALESCE(?, email), name = COALESCE(?, name), role = COALESCE(?, role),
      preferences = COALESCE(?, preferences), updated_at = ? WHERE id = ?
    `);
    stmt.run(data.email ?? existing.email, data.name ?? existing.name, data.role ?? existing.role, data.preferences ? JSON.stringify(data.preferences) : undefined, now, id);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const db = await this.dbPromise;
    const stmt = db.prepare("DELETE FROM users WHERE id = ?");
    return stmt.run(id).changes > 0;
  }

  private mapRow(row: any): User | undefined {
    if (!row) return undefined;
    return {
      ...row,
      preferences: typeof row.preferences === "string" ? JSON.parse(row.preferences) : row.preferences,
    };
  }
}
