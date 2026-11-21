import { defineEventHandler, getQuery } from 'h3';
// @ts-ignore: better-sqlite3 uses export = Database CommonJS syntax
import Database from 'better-sqlite3';
import fs from 'fs';
import { getServerDbPath, getServerSonglistPath } from '../../../utils/server-paths.ts';
import { playRating, grade, type Lamp } from '../../../../app/utils/arcaea-rating.ts';
import { fetchLeaderboardFromVps } from '../../../utils/vps-sync.ts';

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

export interface LeaderboardEntry {
    rank: number;
    userId: number;
    name: string;
    userCode: string;
    characterId: number;
    characterAvatar: string;
    ratingPtt: number;
    totalScore: number;
    playCount: number;
    topRating: number;
    topSongTitle: string;
    topSongId: string;
    topGrade: string;
    topLamp: Lamp;
}

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const diffFilter = query.difficulty !== undefined && query.difficulty !== '' 
        ? Number(query.difficulty) 
        : null;

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
        } catch {}
    }

    const processEntries = (users: any[], scores: any[]): LeaderboardEntry[] => {
        const userStats: Record<number, {
            totalScore: number;
            playCount: number;
            topRating: number;
            topSongTitle: string;
            topSongId: string;
            topGrade: string;
            topLamp: Lamp;
        }> = {};

        for (const s of scores) {
            const constant = songConstants[s.song_id]?.[s.difficulty] ?? 10.0;
            const lamp = clearTypeToLamp(s.clear_type);
            const r = playRating(constant, s.score, lamp);

            if (!userStats[s.user_id]) {
                userStats[s.user_id] = {
                    totalScore: 0,
                    playCount: 0,
                    topRating: 0,
                    topSongTitle: songTitles[s.song_id] || s.song_id,
                    topSongId: s.song_id,
                    topGrade: grade(s.score),
                    topLamp: lamp,
                };
            }

            const st = userStats[s.user_id]!;
            st.totalScore += s.score;
            st.playCount += 1;
            if (r > st.topRating) {
                st.topRating = r;
                st.topSongTitle = songTitles[s.song_id] || s.song_id;
                st.topSongId = s.song_id;
                st.topGrade = grade(s.score);
                st.topLamp = lamp;
            }
        }

        const entries: LeaderboardEntry[] = users
            .filter(u => userStats[u.user_id] && userStats[u.user_id]!.playCount > 0)
            .map(u => {
                const st = userStats[u.user_id]!;
                const charId = u.character_id ?? 0;
                const rawPtt = typeof u.rating_ptt === 'number' ? u.rating_ptt : (Number(u.rating_ptt) || 0);
                const ptt = rawPtt > 100 ? Number((rawPtt / 100).toFixed(2)) : Number(rawPtt.toFixed(3));
                return {
                    rank: 0,
                    userId: u.user_id,
                    name: u.name || `Player #${u.user_id}`,
                    userCode: u.user_code || `00${u.user_id}`,
                    characterId: charId,
                    characterAvatar: `/storage/characters/${charId}_icon.png`,
                    ratingPtt: ptt,
                    totalScore: st.totalScore,
                    playCount: st.playCount,
                    topRating: Number(st.topRating.toFixed(3)),
                    topSongTitle: st.topSongTitle,
                    topSongId: st.topSongId,
                    topGrade: st.topGrade,
                    topLamp: st.topLamp,
                };
            });

        entries.sort((a, b) => {
            if (b.ratingPtt !== a.ratingPtt) return b.ratingPtt - a.ratingPtt;
            return b.totalScore - a.totalScore;
        });

        entries.forEach((e, idx) => {
            e.rank = idx + 1;
        });

        return entries;
    };

    // 1. Try fetching from VPS live database first (Option A)
    try {
        const vpsData = await fetchLeaderboardFromVps(diffFilter);
        if (vpsData && vpsData.users) {
            const leaderboard = processEntries(vpsData.users, vpsData.scores || []);
            return {
                total: leaderboard.length,
                leaderboard,
                source: 'vps',
            };
        }
    } catch (vpsErr) {
        console.warn('[Leaderboard] VPS fetch error, falling back to local DB:', vpsErr);
    }

    // 2. Fallback to local database
    const serverDbPath = getServerDbPath();
    if (!serverDbPath) {
        return {
            total: 0,
            leaderboard: [] as LeaderboardEntry[],
            message: 'Arcaea server database not found',
        };
    }

    try {
        const db = new Database(serverDbPath, { readonly: true });
        const users = db.prepare(`
            SELECT user_id, name, user_code, rating_ptt, character_id
            FROM user
            ORDER BY rating_ptt DESC
        `).all() as Array<{
            user_id: number;
            name: string;
            user_code: string;
            rating_ptt: number;
            character_id: number | null;
        }>;

        let scoreQuery = `
            SELECT 
                user_id, song_id, difficulty, score, clear_type, time_played
            FROM best_score
        `;
        if (diffFilter !== null && !isNaN(diffFilter)) {
            scoreQuery += ` WHERE difficulty = ${diffFilter}`;
        }
        scoreQuery += ` ORDER BY score DESC`;

        const scores = db.prepare(scoreQuery).all() as Array<{
            user_id: number;
            song_id: string;
            difficulty: number;
            score: number;
            clear_type: number;
            time_played: number;
        }>;
        db.close();

        const leaderboard = processEntries(users, scores);

        return {
            total: leaderboard.length,
            leaderboard,
            source: 'local',
        };
    } catch (e: any) {
        return {
            total: 0,
            leaderboard: [] as LeaderboardEntry[],
            error: e.message,
        };
    }
});
