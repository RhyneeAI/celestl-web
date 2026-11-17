import path from 'path';
import fs from 'fs';

export function getServerDbPath(): string | null {
    const candidates = [
        path.resolve(process.cwd(), 'ArcaeaServerFork/database/arcaea_database.db'),
        path.resolve(process.cwd(), '../ArcaeaServerFork/database/arcaea_database.db'),
    ];
    for (const c of candidates) {
        if (fs.existsSync(c)) return c;
    }
    return null;
}

export function getServerSonglistPath(): string | null {
    const candidates = [
        path.resolve(process.cwd(), 'ArcaeaServerFork/database/songs/songlist'),
        path.resolve(process.cwd(), '../ArcaeaServerFork/database/songs/songlist'),
    ];
    for (const c of candidates) {
        if (fs.existsSync(c)) return c;
    }
    return null;
}

export function getServerSongsDir(): string | null {
    const candidates = [
        path.resolve(process.cwd(), 'ArcaeaServerFork/database/songs'),
        path.resolve(process.cwd(), '../ArcaeaServerFork/database/songs'),
    ];
    for (const c of candidates) {
        if (fs.existsSync(c)) return c;
    }
    return null;
}

export function getRecalculateScriptPath(): string | null {
    const candidates = [
        path.resolve(process.cwd(), 'ArcaeaServerFork/tools/recalculate_ratings.py'),
        path.resolve(process.cwd(), '../ArcaeaServerFork/tools/recalculate_ratings.py'),
    ];
    for (const c of candidates) {
        if (fs.existsSync(c)) return c;
    }
    return null;
}
