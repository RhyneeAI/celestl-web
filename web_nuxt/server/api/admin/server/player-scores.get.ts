import { defineEventHandler, getQuery } from 'h3';
// @ts-ignore: better-sqlite3 uses export = Database CommonJS syntax
import Database from 'better-sqlite3';
import fs from 'fs';
import { getServerDbPath, getServerSonglistPath } from '../../../utils/server-paths.ts';
import { playRating, grade, type Lamp } from '../../../../app/utils/arcaea-rating.ts';
import { fetchPlayerScoresFromVps } from '../../../utils/vps-sync.ts';

function clearTypeToLamp(clearType: number): { lamp: Lamp; lampShort: string } {
    switch (clearType) {
        case 3: return { lamp: 'pure_memory', lampShort: 'PM' };
        case 2: return { lamp: 'full_recall', lampShort: 'F' };
        case 1: return { lamp: 'normal_clear', lampShort: 'C' };
        case 4: return { lamp: 'easy_clear', lampShort: 'E' };
        case 5: return { lamp: 'hard_clear', lampShort: 'C' };
        default: return { lamp: 'lost', lampShort: 'L' };
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

function formatArcaeaScore(s: number): string {
    // 8-digit format with apostrophe: e.g. 9972135 -> 09'972'135
    const padded = String(s).padStart(8, '0');
    return `${padded.slice(0, 2)}'${padded.slice(2, 5)}'${padded.slice(5, 8)}`;
}

function formatDate(ts: number): string {
    if (!ts) return '—';
    // Arcaea timestamps are in seconds or milliseconds
    const ms = ts < 10000000000 ? ts * 1000 : ts;
    const d = new Date(ms);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    let hours = d.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;
}

export interface PlayerScoreItem {
    songId: string;
    songTitle: string;
    artist: string;
    difficulty: string;
    ratingClass: number;
    ratingDisplay: string;
    score: number;
    scoreFormatted: string;
    grade: string;
    lamp: Lamp;
    lampShort: string;
    constant: number;
    recalculatedRating: number;
    playedAt: number;
    dateObtained: string;
    jacketUrl: string;
    shinyPerfectCount?: number;
    perfectCount?: number;
    nearCount?: number;
    missCount?: number;
    playsThisYear?: number;
}

export interface PlayerProfile {
    userId: number;
    name: string;
    userCode: string;
    characterId: number;
    characterAvatar: string;
    ratingPtt: number;
    totalScores: number;
    b50Average?: number;
    b10Average?: number;
    bestRating?: number;
}

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const reqUserId = query.userId ? Number(query.userId) : null;
    const diffFilter = query.difficulty !== undefined && query.difficulty !== ''
        ? Number(query.difficulty)
        : null;

    const songlistPath = getServerSonglistPath();
    const songConstants: Record<string, Record<number, number>> = {};
    const songRatings: Record<string, Record<number, string>> = {};
    const songTitles: Record<string, string> = {};
    const songArtists: Record<string, string> = {};

    if (songlistPath && fs.existsSync(songlistPath)) {
        try {
            const raw = JSON.parse(fs.readFileSync(songlistPath, 'utf-8'));
            for (const s of raw.songs || []) {
                songTitles[s.id] = s.title_localized?.en || s.id;
                songArtists[s.id] = s.artist || 'Unknown Artist';
                const diffMap: Record<number, number> = {};
                songConstants[s.id] = diffMap;
                const ratingMap: Record<number, string> = {};
                songRatings[s.id] = ratingMap;
                for (const d of s.difficulties || []) {
                    diffMap[d.ratingClass] = d.constant || d.rating || 0;
                    const rVal = d.rating !== undefined ? d.rating : Math.floor(d.constant || 0);
                    ratingMap[d.ratingClass] = d.ratingPlus ? `${rVal}+` : `${rVal}`;
                }
            }
        } catch { }
    }

    const currentYear = new Date().getFullYear();

    // 1. Try fetching from VPS live database first (Option A)
    try {
        const vpsData = await fetchPlayerScoresFromVps(reqUserId, diffFilter);
        if (vpsData && vpsData.players && vpsData.players.length > 0) {
            const players: PlayerProfile[] = vpsData.players.map(u => {
                const rawPtt = Number(u.rating_ptt) || 0;
                const ptt = rawPtt > 100 ? Number((rawPtt / 100).toFixed(3)) : Number(rawPtt.toFixed(3));
                return {
                    userId: u.user_id,
                    name: u.name || `Player #${u.user_id}`,
                    userCode: u.user_code || `00${u.user_id}`,
                    characterId: u.character_id ?? 0,
                    characterAvatar: `/storage/characters/${u.character_id ?? 0}_icon.png`,
                    ratingPtt: ptt,
                    totalScores: u.total_scores,
                };
            });

            const activeUserId = vpsData.selectedPlayerId;
            const selectedPlayer = players.find(p => p.userId === activeUserId) || null;

            const scores: PlayerScoreItem[] = vpsData.scores.map(r => {
                const constant = songConstants[r.song_id]?.[r.difficulty] ?? 10.0;
                const ratingDisplay = songRatings[r.song_id]?.[r.difficulty] ?? `${Math.floor(constant)}`;
                const { lamp, lampShort } = clearTypeToLamp(r.clear_type);
                const recalculatedRating = playRating(constant, r.score, lamp);
                const playedYear = r.time_played ? new Date(r.time_played * 1000).getFullYear() : 0;

                return {
                    songId: r.song_id,
                    songTitle: songTitles[r.song_id] || r.song_id,
                    artist: songArtists[r.song_id] || 'Arcaea',
                    difficulty: difficultyCode(r.difficulty),
                    ratingClass: r.difficulty,
                    ratingDisplay,
                    score: r.score,
                    scoreFormatted: formatArcaeaScore(r.score),
                    grade: grade(r.score),
                    lamp,
                    lampShort,
                    constant,
                    recalculatedRating: Number(recalculatedRating.toFixed(3)),
                    playedAt: r.time_played,
                    dateObtained: formatDate(r.time_played),
                    jacketUrl: `/api/jacket/${r.song_id}?diff=${r.difficulty}`,
                    shinyPerfectCount: r.shiny_perfect_count ?? 0,
                    perfectCount: r.perfect_count ?? 0,
                    nearCount: r.near_count ?? 0,
                    missCount: r.miss_count ?? 0,
                    playsThisYear: playedYear === currentYear ? 1 : 0,
                };
            });

            scores.sort((a, b) => b.recalculatedRating - a.recalculatedRating);

            if (selectedPlayer) {
                const top50 = scores.slice(0, 50);
                const top10 = scores.slice(0, 10);
                selectedPlayer.b50Average = top50.length > 0
                    ? Number((top50.reduce((acc, s) => acc + s.recalculatedRating, 0) / top50.length).toFixed(3))
                    : 0;
                selectedPlayer.b10Average = top10.length > 0
                    ? Number((top10.reduce((acc, s) => acc + s.recalculatedRating, 0) / top10.length).toFixed(3))
                    : 0;
                selectedPlayer.bestRating = top10.length > 0 ? top10[0]!.recalculatedRating : 0;
            }

            return {
                players,
                selectedPlayer,
                scores,
                source: 'vps',
            };
        }
    } catch (vpsErr) {
        console.warn('[Player Scores] VPS fetch error, falling back to local DB:', vpsErr);
    }

    // 2. Fallback to local SQLite database
    const serverDbPath = getServerDbPath();
    if (!serverDbPath) {
        return {
            players: [] as PlayerProfile[],
            selectedPlayer: null,
            scores: [] as PlayerScoreItem[],
            message: 'Arcaea server database not found',
        };
    }

    try {
        const db = new Database(serverDbPath, { readonly: true });

        // Fetch all players for dropdown
        const users = db.prepare(`
            SELECT 
                u.user_id, 
                u.name, 
                u.user_code, 
                u.rating_ptt, 
                u.character_id,
                COUNT(b.song_id) as total_scores
            FROM user u
            LEFT JOIN best_score b ON u.user_id = b.user_id
            GROUP BY u.user_id
            ORDER BY u.rating_ptt DESC
        `).all() as Array<{
            user_id: number;
            name: string;
            user_code: string;
            rating_ptt: number;
            character_id: number | null;
            total_scores: number;
        }>;

        const players: PlayerProfile[] = users.map(u => {
            const rawPtt = Number(u.rating_ptt) || 0;
            const ptt = rawPtt > 100 ? Number((rawPtt / 100).toFixed(3)) : Number(rawPtt.toFixed(3));
            return {
                userId: u.user_id,
                name: u.name || `Player #${u.user_id}`,
                userCode: u.user_code || `00${u.user_id}`,
                characterId: u.character_id ?? 0,
                characterAvatar: `/storage/characters/${u.character_id ?? 0}_icon.png`,
                ratingPtt: ptt,
                totalScores: u.total_scores,
            };
        });

        // Determine active player
        let activeUserId = reqUserId;
        if (!activeUserId && players.length > 0) {
            const withScores = players.find(p => p.totalScores > 0);
            activeUserId = withScores ? withScores.userId : players[0]!.userId;
        }

        const selectedPlayer = players.find(p => p.userId === activeUserId) || null;

        if (!activeUserId) {
            db.close();
            return {
                players,
                selectedPlayer: null,
                scores: [] as PlayerScoreItem[],
            };
        }

        let sql = `
            SELECT 
                song_id, difficulty, score, shiny_perfect_count, perfect_count, near_count, miss_count, clear_type, time_played
            FROM best_score
            WHERE user_id = ?
        `;
        const params: any[] = [activeUserId];
        if (diffFilter !== null && !isNaN(diffFilter)) {
            sql += ` AND difficulty = ?`;
            params.push(diffFilter);
        }
        sql += ` ORDER BY score DESC`;

        const rows = db.prepare(sql).all(...params) as Array<{
            song_id: string;
            difficulty: number;
            score: number;
            shiny_perfect_count: number;
            perfect_count: number;
            near_count: number;
            miss_count: number;
            clear_type: number;
            time_played: number;
        }>;
        db.close();

        const scores: PlayerScoreItem[] = rows.map(r => {
            const constant = songConstants[r.song_id]?.[r.difficulty] ?? 10.0;
            const ratingDisplay = songRatings[r.song_id]?.[r.difficulty] ?? `${Math.floor(constant)}`;
            const { lamp, lampShort } = clearTypeToLamp(r.clear_type);
            const recalculatedRating = playRating(constant, r.score, lamp);
            const playedYear = r.time_played ? new Date(r.time_played * 1000).getFullYear() : 0;

            return {
                songId: r.song_id,
                songTitle: songTitles[r.song_id] || r.song_id,
                artist: songArtists[r.song_id] || 'Arcaea',
                difficulty: difficultyCode(r.difficulty),
                ratingClass: r.difficulty,
                ratingDisplay,
                score: r.score,
                scoreFormatted: formatArcaeaScore(r.score),
                grade: grade(r.score),
                lamp,
                lampShort,
                constant,
                recalculatedRating: Number(recalculatedRating.toFixed(3)),
                playedAt: r.time_played,
                dateObtained: formatDate(r.time_played),
                jacketUrl: `/api/jacket/${r.song_id}?diff=${r.difficulty}`,
                shinyPerfectCount: r.shiny_perfect_count ?? 0,
                perfectCount: r.perfect_count ?? 0,
                nearCount: r.near_count ?? 0,
                missCount: r.miss_count ?? 0,
                playsThisYear: playedYear === currentYear ? 1 : 0,
            };
        });

        // Default sort: highest rating to lowest rating
        scores.sort((a, b) => b.recalculatedRating - a.recalculatedRating);

        // Calculate B50 & B10 stats for selected player
        if (selectedPlayer) {
            const top50 = scores.slice(0, 50);
            const top10 = scores.slice(0, 10);
            selectedPlayer.b50Average = top50.length > 0
                ? Number((top50.reduce((acc, s) => acc + s.recalculatedRating, 0) / top50.length).toFixed(3))
                : 0;
            selectedPlayer.b10Average = top10.length > 0
                ? Number((top10.reduce((acc, s) => acc + s.recalculatedRating, 0) / top10.length).toFixed(3))
                : 0;
            selectedPlayer.bestRating = top10.length > 0 ? top10[0]!.recalculatedRating : 0;
        }

        return {
            players,
            selectedPlayer,
            scores,
            source: 'local',
        };
    } catch (e: any) {
        return {
            players: [] as PlayerProfile[],
            selectedPlayer: null,
            scores: [] as PlayerScoreItem[],
            error: e.message,
        };
    }
});
