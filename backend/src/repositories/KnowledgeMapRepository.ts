import { v4 as uuidv4 } from "uuid";
import { getDatabase } from "../config/database.js";
import type { KnowledgeMap, GraphNode, GraphEdge } from "../models/index.js";

export class KnowledgeMapRepository {
  private dbPromise = getDatabase();

  async create(data: Omit<KnowledgeMap, "id" | "createdAt" | "updatedAt">): Promise<KnowledgeMap> {
    const db = await this.dbPromise;
    const id = uuidv4();
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO knowledge_maps (id, user_id, name, nodes, edges, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, data.userId, data.name, JSON.stringify(data.nodes), JSON.stringify(data.edges), now, now);
    return (await this.findById(id))!;
  }

  async findById(id: string): Promise<KnowledgeMap | undefined> {
    const db = await this.dbPromise;
    const stmt = db.prepare("SELECT * FROM knowledge_maps WHERE id = ?");
    return this.mapRow(stmt.get(id));
  }

  async findByUser(userId: string): Promise<KnowledgeMap[]> {
    const db = await this.dbPromise;
    const stmt = db.prepare("SELECT * FROM knowledge_maps WHERE user_id = ? ORDER BY updated_at DESC");
    const rows = stmt.all(userId) as any[];
    return rows.map(this.mapRow).filter((m): m is KnowledgeMap => m !== undefined);
  }

  async update(id: string, data: Partial<Omit<KnowledgeMap, "id" | "userId" | "createdAt">>): Promise<KnowledgeMap | undefined> {
    const db = await this.dbPromise;
    const existing = await this.findById(id);
    if (!existing) return undefined;
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      UPDATE knowledge_maps SET name = COALESCE(?, name), nodes = COALESCE(?, nodes), edges = COALESCE(?, edges), updated_at = ? WHERE id = ?
    `);
    stmt.run(data.name ?? existing.name, data.nodes ? JSON.stringify(data.nodes) : undefined, data.edges ? JSON.stringify(data.edges) : undefined, now, id);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const db = await this.dbPromise;
    const stmt = db.prepare("DELETE FROM knowledge_maps WHERE id = ?");
    return stmt.run(id).changes > 0;
  }

  private mapRow(row: any): KnowledgeMap | undefined {
    if (!row) return undefined;
    return {
      ...row,
      nodes: typeof row.nodes === "string" ? JSON.parse(row.nodes) : row.nodes,
      edges: typeof row.edges === "string" ? JSON.parse(row.edges) : row.edges,
    };
  }
}
