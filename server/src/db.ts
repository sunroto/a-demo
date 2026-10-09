import Database from 'better-sqlite3'
import { mkdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export type DB = Database.Database

const dataDir = fileURLToPath(new URL('../data/', import.meta.url))
export const defaultDbPath = path.join(dataDir, 'dictation.db')

const SCHEMA = `
CREATE TABLE IF NOT EXISTS texts (
  id         INTEGER PRIMARY KEY,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS attempts (
  id         INTEGER PRIMARY KEY,
  text_id    INTEGER NOT NULL REFERENCES texts(id),
  input      TEXT NOT NULL,
  score      REAL NOT NULL CHECK (score >= 0 AND score <= 1),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_attempts_created_at ON attempts (created_at);
CREATE INDEX IF NOT EXISTS idx_attempts_text_id ON attempts (text_id);
`

function readSql(file: string): string {
  return readFileSync(path.join(dataDir, file), 'utf8')
}

// Texts are seeded idempotently on every start; demo attempts only on first
// initialization, so clearing the attempts table survives restarts.
export function openDatabase(file: string = defaultDbPath): DB {
  mkdirSync(path.dirname(file), { recursive: true })
  const db = new Database(file)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  db.transaction(() => {
    db.exec(SCHEMA)
    const { n } = db.prepare('SELECT COUNT(*) AS n FROM texts').get() as { n: number }
    db.exec(readSql('seed.sql'))
    if (n === 0) {
      db.exec(readSql('seed-attempts.sql'))
    }
  })()

  return db
}
