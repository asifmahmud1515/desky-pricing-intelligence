import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const DB_PATH = path.join(process.cwd(), "data", "pricing.db");
const SCHEMA_PATH = path.join(process.cwd(), "data", "schema.sql");

/** Read-write handle. Only used by the scrape script (local / CI), never at request time. */
export function getWriteDb(): Database.Database {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(fs.readFileSync(SCHEMA_PATH, "utf-8"));
  return db;
}

let _readDb: Database.Database | null = null;

/** Read-only handle, safe on a read-only filesystem (e.g. Vercel's serverless runtime). */
export function getReadDb(): Database.Database {
  if (_readDb) return _readDb;
  _readDb = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  return _readDb;
}
