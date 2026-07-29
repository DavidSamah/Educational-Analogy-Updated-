import { v4 as uuidv4 } from "uuid";
import { getDatabase } from "../config/database.js";
import type { Bookmark } from "../models/index.js";

export class BookmarkRepository {
  private dbPromise = getDatabase();

  async create(data: Omit<Bookmark, "id" | "createdAt">): Promise<Bookmark> {
    const db = await this.dbPromise;
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO bookmarks (id, user_id, item_type, item_id, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `);
    stmt.run(id, data.userId, data.itemType, data.itemId);
    return (await this.findById(id))!;
  }

  async findById(id: string): Promise<Bookmark | undefined> {
    const db = await this.dbPromise;
    const stmt = db.prepare("SELECT * FROM bookmarks WHERE id = ?");
    return this.mapRow(stmt.get(id));
  }

  async findByUser(userId: string, itemType?: string): Promise<Bookmark[]> {
    const db = await this.dbPromise;
    let stmt;
    if (itemType) {
      stmt = db.prepare("SELECT * FROM bookmarks WHERE user_id = ? AND item_type = ? ORDER BY created_at DESC");
      return stmt.all(userId, itemType).map(this.mapRow).filter((b): b is Bookmark => b !== undefined);
    }
    stmt = db.prepare("SELECT * FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC");
    return stmt.all(userId).map(this.mapRow).filter((b): b is Bookmark => b !== undefined);
  }

  async findByUserAndItem(userId: string, itemType: string, itemId: string): Promise<Bookmark | undefined> {
    const db = await this.dbPromise;
    const stmt = db.prepare("SELECT * FROM bookmarks WHERE user_id = ? AND item_type = ? AND item_id = ?");
    return this.mapRow(stmt.get(userId, itemType, itemId));
  }

  async delete(id: string): Promise<boolean> {
    const db = await this.dbPromise;
    const stmt = db.prepare("DELETE FROM bookmarks WHERE id = ?");
    return stmt.run(id).changes > 0;
  }

  async deleteByUserAndItem(userId: string, itemType: string, itemId: string): Promise<boolean> {
    const db = await this.dbPromise;
    const stmt = db.prepare("DELETE FROM bookmarks WHERE user_id = ? AND item_type = ? AND item_id = ?");
    return stmt.run(userId, itemType, itemId).changes > 0;
  }

  private mapRow(row: any): Bookmark | undefined {
    if (!row) return undefined;
    return { ...row };
  }
}
