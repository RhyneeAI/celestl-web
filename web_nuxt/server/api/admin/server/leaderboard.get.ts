import { defineEventHandler, getQuery } from 'h3';
import Database from 'better-sqlite3';
import fs from 'fs';
import { getServerDbPath, getServerSonglistPath } from '../../../utils/server-paths.ts';
import { playRating, formatScore, grade, type Lamp } from '../../../../app/utils/arcaea-rating.ts';

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
    totalScoreFormatted: string;
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
        : null; // null = overall all difficulties, or 0=PST, 1=PRS, 2=FTR, 3=BYD, 4=ETR

    const serverDbPath = getServerDbPath();
    if (!serverDbPath) {
        return {
            total: 0,
            leaderboard: [] as LeaderboardEntry[],
            message: 'Arcaea server database not found',
        };
    }

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

    try {
        const db = new Database(serverDbPath, { readonly: true });
        
        // Fetch all active users
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

        // Fetch scores (filtered by difficulty if specified)
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

        // Group scores by user
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
                return {
                    rank: 0,
                    userId: u.user_id,
                    name: u.name || `Player #${u.user_id}`,
                    userCode: u.user_code || `00${u.user_id}`,
                    characterId: charId,
                    characterAvatar: `/storage/characters/${charId}_icon.png`,
                    ratingPtt: Number((u.rating_ptt / 100).toFixed(2)) || 0,
                    totalScore: st.totalScore,
                    totalScoreFormatted: st.totalScore.toLocaleString('en-US'),
                    playCount: st.playCount,
                    topRating: Number(st.topRating.toFixed(3)),
                    topSongTitle: st.topSongTitle,
                    topSongId: st.topSongId,
                    topGrade: st.topGrade,
                    topLamp: st.topLamp,
                };
            });

        // Sort by total score descending (matching Arcaea leaderboard in Image 1: TAKUAN 5,590,578,790)
        entries.sort((a, b) => b.totalScore - a.totalScore);

        // Assign ranks
        entries.forEach((entry, idx) => {
            entry.rank = idx + 1;
        });

        return {
            total: entries.length,
            leaderboard: entries,
        };
    } catch (e: any) {
        return {
            total: 0,
            leaderboard: [] as LeaderboardEntry[],
            error: e.message,
        };
    }
});
