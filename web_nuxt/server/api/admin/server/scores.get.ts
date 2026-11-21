import { defineEventHandler } from 'h3';
// @ts-ignore: better-sqlite3 uses export = Database CommonJS syntax
import Database from 'better-sqlite3';
import fs from 'fs';
import { getServerDbPath, getServerSonglistPath } from '../../../utils/server-paths.ts';
import { playRating, grade, type Lamp } from '../../../../app/utils/arcaea-rating.ts';
import { fetchRecentScoresFromVps } from '../../../utils/vps-sync.ts';

function clearTypeToLamp(clearType: number): Lamp {
    switch (clearType) {
        case 3: return 'pure_memory';
        case 2: return 'full_recall';
        case 1: return 'normal_clear';
        case 4: return 'easy_clear';
        case 5: return 'hard_clear';
        default: return 'lost';
    }
}

function difficultyCode(rc: number): string {
    switch (rc) {
        case 0: return 'PST';
        case 1: return 'PRS';
        case 2: return 'FTR';
        case 3: return 'BYD';
        case 4: return 'ETR';
        default: return `RC${rc}`;
    }
}

function formatScore(s: number): string {
    const padded = String(s).padStart(8, '0');
    return `${padded.slice(0, 2)}'${padded.slice(2, 5)}'${padded.slice(5, 8)}`;
}

export interface ServerScoreItem {
    userId: number;
    playerName: string;
    playerCode: string;
    songId: string;
    songTitle: string;
    difficulty: string;
    ratingClass: number;
    score: number;
    scoreFormatted: string;
    grade: string;
    shinyPure: number;
    pure: number;
    far: number;
    lost: number;
    clearType: number;
    lamp: Lamp;
    constant: number;
    serverRating: number;
    recalculatedRating: number;
    playedAt: number;
}

export default defineEventHandler(async () => {
    const songlistPath = getServerSonglistPath();
    const songConstants: Record<string, Record<number, number>> = {};
    const songTitles: Record<string, string> = {};

    if (songlistPath && fs.existsSync(songlistPath)) {
        try {
            const raw = JSON.parse(fs.readFileSync(songlistPath, 'utf-8'));
            for (const s of raw.songs || []) {
                songTitles[s.id] = s.title_localized?.en || s.id;
                const diffMap: Record<number, number> = {};
                songConstants[s.id] = diffMap;
                for (const d of s.difficulties || []) {
                    diffMap[d.ratingClass] = d.constant || d.rating || 0;
                }
            }
        } catch { }
    }

    const mapRow = (r: any): ServerScoreItem => {
        const lamp = clearTypeToLamp(r.clear_type);
        const constant = songConstants[r.song_id]?.[r.difficulty] ?? 10.0;
        const recalculatedRating = playRating(constant, r.score, lamp);

        return {
            userId: r.user_id,
            playerName: r.player_name || `Player #${r.user_id}`,
            playerCode: r.player_code || '',
            songId: r.song_id,
            songTitle: songTitles[r.song_id] || r.song_id,
            difficulty: difficultyCode(r.difficulty),
            ratingClass: r.difficulty,
            score: r.score,
            scoreFormatted: formatScore(r.score),
            grade: grade(r.score),
            shinyPure: r.shiny_perfect_count ?? 0,
            pure: r.perfect_count ?? 0,
            far: r.near_count ?? 0,
            lost: r.miss_count ?? 0,
            clearType: r.clear_type,
            lamp,
            constant,
            serverRating: r.server_rating ?? 0,
            recalculatedRating,
            playedAt: r.time_played,
        };
    };

    // 1. Try fetching from VPS live database first (Option A)
    try {
        const vpsRows = await fetchRecentScoresFromVps();
        if (vpsRows) {
            const scores: ServerScoreItem[] = vpsRows.map(mapRow);
            scores.sort((a, b) => b.recalculatedRating - a.recalculatedRating);
            return {
                total: scores.length,
                scores,
                source: 'vps',
            };
        }
    } catch (vpsErr) {
        console.warn('[Admin Scores] VPS fetch error, falling back to local DB:', vpsErr);
    }

    // 2. Fallback to local database
    const serverDbPath = getServerDbPath();
    if (!serverDbPath) {
        return {
            total: 0,
            scores: [] as ServerScoreItem[],
            message: 'Arcaea server database not found',
        };
    }

    try {
        const db = new Database(serverDbPath, { readonly: true });
        const rows = db.prepare(`
            SELECT 
                b.user_id,
                b.song_id,
                b.difficulty,
                b.score,
                b.shiny_perfect_count,
                b.perfect_count,
                b.near_count,
                b.miss_count,
                b.health,
                b.clear_type,
                b.rating AS server_rating,
                b.time_played,
                u.name AS player_name,
                u.user_code AS player_code
            FROM best_score b
            LEFT JOIN user u ON b.user_id = u.user_id
            ORDER BY b.score DESC
        `).all();
        db.close();

        const scores: ServerScoreItem[] = rows.map(mapRow);
        scores.sort((a, b) => b.recalculatedRating - a.recalculatedRating);

        return {
            total: scores.length,
            scores,
            source: 'local',
        };
    } catch (e: any) {
        return {
            total: 0,
            scores: [] as ServerScoreItem[],
            error: e.message,
        };
    }
});
