import initSqlJs from "sql.js";
import { env } from "./env.js";

type Database = {
  prepare(sql: string): Statement;
  exec(sql: string): Result[];
  pragma(sql: string): void;
};

type Statement = {
  run(...params: any[]): Result;
  get(...params: any[]): any;
  all(...params: any[]): any[];
};

type Result = {
  changes: number;
  lastInsertRowid: number;
};

let dbPromise: Promise<Database> | null = null;

export async function initDatabase(): Promise<Database> {
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    const SQL = await initSqlJs();
    const jsDb = new SQL.Database();

    jsDb.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'student' CHECK(role IN ('student','teacher','admin')),
        preferences TEXT DEFAULT '{}',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS concepts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        definition TEXT NOT NULL,
        category TEXT,
        difficulty TEXT DEFAULT 'intermediate',
        domain TEXT,
        created_by TEXT,
        version INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS relationships (
        id TEXT PRIMARY KEY,
        source_id TEXT NOT NULL,
        target_id TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('is_a','part_of','requires','causes','depends_on','similar_to','opposite_of','analogy_of','used_in','derived_from')),
        confidence REAL DEFAULT 1.0,
        source TEXT,
        weight REAL DEFAULT 1.0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS analogies (
        id TEXT PRIMARY KEY,
        concept_id TEXT NOT NULL,
        user_id TEXT,
        content TEXT NOT NULL,
        style TEXT DEFAULT 'technology',
        difficulty TEXT DEFAULT 'intermediate',
        perspective TEXT,
        mapping TEXT DEFAULT '[]',
        explanation TEXT,
        limitations TEXT,
        misconceptions TEXT DEFAULT '[]',
        confidence_score REAL DEFAULT 0.0,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS practice_attempts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        mode TEXT NOT NULL,
        concept_id TEXT,
        user_answer TEXT NOT NULL,
        feedback TEXT DEFAULT '{}',
        score REAL DEFAULT 0.0,
        strengths TEXT DEFAULT '[]',
        weaknesses TEXT DEFAULT '[]',
        misconceptions TEXT DEFAULT '[]',
        suggestions TEXT DEFAULT '[]',
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS learning_paths (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        stages TEXT DEFAULT '[]',
        current_stage INTEGER DEFAULT 0,
        completed_concepts TEXT DEFAULT '[]',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS knowledge_maps (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        nodes TEXT DEFAULT '[]',
        edges TEXT DEFAULT '[]',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS bookmarks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        item_type TEXT NOT NULL,
        item_id TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS learning_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        concept_id TEXT,
        duration INTEGER DEFAULT 0,
        activities TEXT DEFAULT '[]',
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_concepts_title ON concepts(title);
      CREATE INDEX IF NOT EXISTS idx_relationships_source ON relationships(source_id);
      CREATE INDEX IF NOT EXISTS idx_relationships_target ON relationships(target_id);
      CREATE INDEX IF NOT EXISTS idx_analogies_concept ON analogies(concept_id);
      CREATE INDEX IF NOT EXISTS idx_practice_user ON practice_attempts(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_user ON learning_sessions(user_id);
    `);

    const db: Database = {
      prepare(sql: string): Statement {
        const stmt = jsDb.prepare(sql);
        return {
          run(...params: any[]): Result {
            stmt.bind(params);
            stmt.step();
            const result: Result = {
              changes: jsDb.getRowsModified(),
              lastInsertRowid: 0,
            };
            stmt.free();
            return result;
          },
          get(...params: any[]): any {
            stmt.bind(params);
            if (!stmt.step()) {
              stmt.free();
              return undefined;
            }
            const row = stmt.getAsObject();
            stmt.free();
            return row;
          },
          all(...params: any[]): any[] {
            stmt.bind(params);
            const rows: any[] = [];
            while (stmt.step()) {
              rows.push(stmt.getAsObject());
            }
            stmt.free();
            return rows;
          },
        };
      },
      exec(sql: string): Result[] {
        return jsDb.exec(sql);
      },
      pragma(sql: string): void {
        jsDb.run(sql);
      },
    };

    return db;
  })();

  return dbPromise;
}

export function getDatabase(): Promise<Database> {
  if (!dbPromise) {
    initDatabase();
  }
  return dbPromise as Promise<Database>;
}

export function closeDatabase(): void {
  dbPromise = null;
}
