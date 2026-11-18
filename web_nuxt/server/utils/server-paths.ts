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

export function getValidateAffScriptPath(): string | null {
    const candidates = [
        path.resolve(process.cwd(), 'ArcaeaServerFork/tools/validate_single_aff.py'),
        path.resolve(process.cwd(), '../ArcaeaServerFork/tools/validate_single_aff.py'),
    ];
    for (const c of candidates) {
        if (fs.existsSync(c)) return c;
    }
    return null;
}

export function getPacklistPath(): string | null {
    const candidates = [
        path.resolve(process.cwd(), 'data/packlist.json'),
        path.resolve(process.cwd(), '../data/packlist.json'),
        path.resolve(process.cwd(), 'ArcaeaServerFork/database/init/packs.json'),
        path.resolve(process.cwd(), '../ArcaeaServerFork/database/init/packs.json'),
    ];
    for (const c of candidates) {
        if (fs.existsSync(c)) return c;
    }
    return null;
}

export function getSongDir(slug: string): string | null {
    const cleanSlug = slug.trim();
    if (!cleanSlug) return null;
    const candidates = [
        path.resolve(process.cwd(), 'ArcaeaServerFork/database/songs', cleanSlug),
        path.resolve(process.cwd(), '../ArcaeaServerFork/database/songs', cleanSlug),
        path.resolve(process.cwd(), 'ArcaeaServerFork/database/songs', `dl_${cleanSlug}`),
        path.resolve(process.cwd(), '../ArcaeaServerFork/database/songs', `dl_${cleanSlug}`),
    ];
    for (const c of candidates) {
        if (fs.existsSync(c) && fs.statSync(c).isDirectory()) return c;
    }
    return null;
}

const durationCache = new Map<string, { mtime: number; duration: string }>();

/**
 * Extracts and formats Vorbis audio duration (m:ss) from an Ogg file
 * by parsing BOS page sample rate and EOS page granule position.
 */
export function getOggDurationFormatted(filePath: string): string | null {
    try {
        if (!fs.existsSync(filePath)) return null;
        const stat = fs.statSync(filePath);
        if (stat.size < 256) return null;

        const cached = durationCache.get(filePath);
        if (cached && cached.mtime === stat.mtimeMs) {
            return cached.duration;
        }

        const fd = fs.openSync(filePath, 'r');
        try {
            const headBuf = Buffer.alloc(256);
            fs.readSync(fd, headBuf, 0, 256, 0);
            if (headBuf.toString('ascii', 0, 4) !== 'OggS') return null;

            const pageSegments = headBuf[26];
            const bodyOffset = 27 + pageSegments;
            if (headBuf.toString('ascii', bodyOffset, bodyOffset + 7) !== '\x01vorbis') return null;

            const sampleRate = headBuf.readUInt32LE(bodyOffset + 12);
            if (!sampleRate) return null;

            const tailSize = Math.min(stat.size, 65536);
            const tailBuf = Buffer.alloc(tailSize);
            fs.readSync(fd, tailBuf, 0, tailSize, stat.size - tailSize);

            const needle = Buffer.from('OggS');
            let lastOggs = tailBuf.lastIndexOf(needle);
            if (lastOggs === -1) return null;

            let granule = tailBuf.readBigUInt64LE(lastOggs + 6);
            while (granule === 0xffffffffffffffffn || granule === 0n) {
                lastOggs = tailBuf.subarray(0, lastOggs).lastIndexOf(needle);
                if (lastOggs === -1) break;
                granule = tailBuf.readBigUInt64LE(lastOggs + 6);
            }

            if (granule === 0xffffffffffffffffn || granule === 0n) return null;

            const sec = Math.round(Number(granule) / sampleRate);
            const m = Math.floor(sec / 60);
            const s = Math.floor(sec % 60);
            const formatted = `${m}:${s.toString().padStart(2, '0')}`;

            durationCache.set(filePath, { mtime: stat.mtimeMs, duration: formatted });
            return formatted;
        } finally {
            fs.closeSync(fd);
        }
    } catch {
        return null;
    }
}
