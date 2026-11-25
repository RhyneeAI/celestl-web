// @ts-ignore: better-sqlite3 uses export = Database CommonJS syntax
import Database from 'better-sqlite3';
import fs from 'fs';
import { db, schema } from '../database/index.ts';
import { getServerDbPath, getServerSonglistPath } from './server-paths.ts';
import { fetchChartsFromVps, fetchSonglistFromVps } from './vps-sync.ts';

export interface SongMetadataLookup {
    songTitles: Record<string, string>;
    songArtists: Record<string, string>;
    songConstants: Record<string, Record<number, number>>;
    songRatings: Record<string, Record<number, string>>;
}

const DIFF_CODE_TO_RC: Record<string, number> = {
    PST: 0,
    PRS: 1,
    FTR: 2,
    BYD: 3,
    ETR: 4,
    INS: 5,
};

function formatRatingFromConstant(constant: number): string {
    const base = Math.floor(constant + 1e-6);
    const dec = Math.round((constant - base) * 10);
    const isPlus = base < 11 ? dec >= 7 : dec >= 8;
    return isPlus ? `${base}+` : `${base}`;
}

/**
 * Build unified song metadata and chart constant lookup across:
 * 1. Official catalog in celestl.sqlite (provides offline APK songs like infinityheaven)
 * 2. Server `chart` table (live VPS first, local SQLite fallback)
 * 3. Server `songlist` JSON (live VPS first, local file fallback)
 */
export async function loadSongMetadataLookup(): Promise<SongMetadataLookup> {
    const songTitles: Record<string, string> = {};
    const songArtists: Record<string, string> = {};
    const songConstants: Record<string, Record<number, number>> = {};
    const songRatings: Record<string, Record<number, string>> = {};

    // 1. Official catalog (celestl.sqlite) for built-in offline APK songs
    try {
        const offSongs = db.select({
            id: schema.officialSongs.id,
            slug: schema.officialSongs.slug,
            title: schema.officialSongs.title,
            artist: schema.officialSongs.artist,
        }).from(schema.officialSongs).all();

        const slugById = new Map<number, string>();
        for (const s of offSongs) {
            slugById.set(s.id, s.slug);
            songTitles[s.slug] = s.title;
            songArtists[s.slug] = s.artist;
        }

        const offCharts = db.select({
            songId: schema.officialCharts.songId,
            difficulty: schema.officialCharts.difficulty,
            level: schema.officialCharts.level,
            constant: schema.officialCharts.constant,
        }).from(schema.officialCharts).all();

        for (const c of offCharts) {
            const slug = slugById.get(c.songId);
            const rc = DIFF_CODE_TO_RC[c.difficulty];
            if (!slug || rc === undefined) continue;

            if (!songConstants[slug]) songConstants[slug] = {};
            if (!songRatings[slug]) songRatings[slug] = {};

            if (c.constant !== null && c.constant !== undefined) {
                songConstants[slug][rc] = c.constant;
            }
            if (c.level) {
                songRatings[slug][rc] = c.level;
            }
        }
    } catch (err) {
        console.warn('[Song Metadata] Failed to load official catalog:', err);
    }

    // 2. Server `chart` table (VPS live first, local SQLite fallback)
    try {
        let chartRows = await fetchChartsFromVps();
        if (!chartRows) {
            const dbPath = getServerDbPath();
            if (dbPath && fs.existsSync(dbPath)) {
                const sqliteDb = new Database(dbPath, { readonly: true });
                chartRows = sqliteDb.prepare(
                    'SELECT song_id, name, rating_pst, rating_prs, rating_ftr, rating_byn, rating_etr FROM chart'
                ).all() as any[];
                sqliteDb.close();
            }
        }

        if (chartRows) {
            for (const row of chartRows) {
                const sid = row.song_id;
                if (!sid) continue;
                if (row.name && !songTitles[sid]) {
                    songTitles[sid] = row.name;
                }
                if (!songConstants[sid]) songConstants[sid] = {};
                if (!songRatings[sid]) songRatings[sid] = {};

                const rawVals: Array<[number, number]> = [
                    [0, row.rating_pst],
                    [1, row.rating_prs],
                    [2, row.rating_ftr],
                    [3, row.rating_byn],
                    [4, row.rating_etr],
                ];
                for (const [rc, val] of rawVals) {
                    if (typeof val === 'number' && val > 0) {
                        const cc = Number((val / 10).toFixed(1));
                        songConstants[sid][rc] = cc;
                        if (!songRatings[sid][rc]) {
                            songRatings[sid][rc] = formatRatingFromConstant(cc);
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.warn('[Song Metadata] Failed to load server chart table:', err);
    }

    // 3. Server `songlist` (VPS live first, local file fallback)
    try {
        let rawSonglist: any = await fetchSonglistFromVps();
        if (!rawSonglist) {
            const songlistPath = getServerSonglistPath();
            if (songlistPath && fs.existsSync(songlistPath)) {
                rawSonglist = JSON.parse(fs.readFileSync(songlistPath, 'utf-8'));
            }
        }

        if (rawSonglist?.songs) {
            for (const s of rawSonglist.songs) {
                songTitles[s.id] = s.title_localized?.en || songTitles[s.id] || s.id;
                songArtists[s.id] = s.artist || songArtists[s.id] || 'Unknown Artist';
                if (!songConstants[s.id]) songConstants[s.id] = {};
                if (!songRatings[s.id]) songRatings[s.id] = {};

                for (const d of s.difficulties || []) {
                    songConstants[s.id][d.ratingClass] = d.constant ?? d.rating ?? 0;
                    const rVal = d.rating !== undefined ? d.rating : Math.floor(d.constant || 0);
                    songRatings[s.id][d.ratingClass] = d.ratingPlus ? `${rVal}+` : `${rVal}`;
                }
            }
        }
    } catch (err) {
        console.warn('[Song Metadata] Failed to load server songlist:', err);
    }

    return {
        songTitles,
        songArtists,
        songConstants,
        songRatings,
    };
}
