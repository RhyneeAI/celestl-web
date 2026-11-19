// @ts-ignore: better-sqlite3 uses export = Database CommonJS syntax
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.ts';
import path from 'path';
import fs from 'fs';

function getDatabasePath(): string {
    if (process.env.CELESTL_DB_PATH) {
        return process.env.CELESTL_DB_PATH;
    }
    const candidates = [
        path.resolve(process.cwd(), 'web_nuxt/server/database/data/celestl.sqlite'),
        path.resolve(process.cwd(), 'server/database/data/celestl.sqlite'),
    ];
    for (const c of candidates) {
        if (fs.existsSync(c)) return c;
    }
    // Default to web_nuxt location if running from root, or server location if running inside web_nuxt
    const fallback = (fs.existsSync(path.resolve(process.cwd(), 'web_nuxt')) 
        ? candidates[0] 
        : candidates[1]) || path.resolve(process.cwd(), 'web_nuxt/server/database/data/celestl.sqlite');
    fs.mkdirSync(path.dirname(fallback), { recursive: true });
    return fallback;
}

const dbPath = getDatabasePath();
const sqlite = new Database(dbPath);

// Enable WAL mode for high performance
sqlite.pragma('journal_mode = WAL');

// Auto-create tables if not exist on startup
sqlite.exec(`
CREATE TABLE IF NOT EXISTS official_games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS official_packs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER REFERENCES official_games(id),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    section TEXT,
    parent_id INTEGER,
    small_pack_image INTEGER DEFAULT 0,
    image_path TEXT,
    image_thumb_path TEXT,
    image_trim_width INTEGER,
    image_trim_height INTEGER
);

CREATE TABLE IF NOT EXISTS official_songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER REFERENCES official_games(id),
    pack_id INTEGER REFERENCES official_packs(id),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    title_localized TEXT,
    artist TEXT NOT NULL,
    composer TEXT,
    jacket_designer TEXT,
    side TEXT,
    bpm TEXT,
    length INTEGER,
    version TEXT,
    released_at TEXT,
    jacket_path TEXT,
    jacket_thumb_path TEXT,
    is_official INTEGER DEFAULT 1,
    package_dir TEXT
);

CREATE TABLE IF NOT EXISTS official_charts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    song_id INTEGER NOT NULL REFERENCES official_songs(id),
    difficulty TEXT NOT NULL,
    level TEXT NOT NULL,
    constant REAL,
    rating_plus INTEGER DEFAULT 0,
    chart_designer TEXT,
    jacket_designer TEXT,
    note_count INTEGER,
    jacket_path TEXT,
    game_version TEXT
);

CREATE TABLE IF NOT EXISTS unofficial_songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    song_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    bpm TEXT,
    is_official INTEGER DEFAULT 0,
    package_dir TEXT,
    created_at INTEGER,
    updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS unofficial_charts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    song_id INTEGER NOT NULL REFERENCES unofficial_songs(id),
    difficulty TEXT NOT NULL,
    rating INTEGER NOT NULL,
    constant REAL,
    chart_designer TEXT,
    aff_path TEXT,
    audio_override INTEGER DEFAULT 0,
    pushed_at INTEGER,
    updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS admin_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    totp_secret TEXT NOT NULL,
    confirmed_at INTEGER,
    created_at INTEGER,
    singleton INTEGER NOT NULL UNIQUE DEFAULT 1
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT NOT NULL UNIQUE,
    nickname TEXT NOT NULL,
    created_at INTEGER,
    updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS game_identities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    game_id INTEGER REFERENCES official_games(id),
    player_id TEXT NOT NULL,
    nickname TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS plays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    chart_id INTEGER REFERENCES official_charts(id),
    score INTEGER NOT NULL,
    shiny_pure INTEGER DEFAULT 0,
    pure INTEGER NOT NULL,
    far INTEGER NOT NULL,
    lost INTEGER NOT NULL,
    clear_type TEXT NOT NULL,
    play_rating REAL NOT NULL,
    played_at INTEGER
);
`);

function ensureColumn(table: string, column: string, definition: string) {
    const cols = sqlite.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
    if (!cols.some((c) => c.name === column)) {
        sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    }
}

ensureColumn('official_songs', 'is_official', 'INTEGER DEFAULT 1');
ensureColumn('official_songs', 'package_dir', 'TEXT');
ensureColumn('unofficial_songs', 'is_official', 'INTEGER DEFAULT 0');
ensureColumn('unofficial_songs', 'package_dir', 'TEXT');

export const db = drizzle(sqlite, { schema });
export { schema };
