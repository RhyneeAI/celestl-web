import { defineEventHandler } from 'h3';
// @ts-ignore: better-sqlite3 uses export = Database CommonJS syntax
import Database from 'better-sqlite3';
import { getServerDbPath } from '../../../../utils/server-paths.ts';
import { fetchAdminPlayersFromVps } from '../../../../utils/vps-sync.ts';
import { loadSongMetadataLookup } from '../../../../utils/song-metadata.ts';
import { grade } from '../../../../../app/utils/arcaea-rating.ts';

export interface ClearStats {
    clear: number;
    fr: number;
    pm: number;
    total: number;
}

export interface PlayerClearsMap {
    all: ClearStats;
    pst: ClearStats;
    prs: ClearStats;
    ftr: ClearStats;
    byd: ClearStats;
    etr: ClearStats;
}

export interface AdminPlayerItem {
    userId: number;
    name: string;
    userCode: string;
    email: string;
    ratingPtt: number;
    ratingPttFormatted: string;
    worldRank: number | null;
    memories: number;
    characterId: number;
    characterAvatar: string;
    isBanned: boolean;
    isMockAccount: boolean;
    banReason: string | null;
    joinDate: string;
    joinTimestamp: number;
    playCount: number;
    clears: PlayerClearsMap;
    recentPlay: {
        songId: string;
        songTitle: string;
        difficulty: number;
        difficultyCode: string;
        score: number;
        scoreFormatted: string;
        grade: string;
        clearType: number;
        timePlayed: number;
        relativeTime: string;
    } | null;
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

function formatRelativeTime(ts: number): string {
    if (!ts) return 'Never';
    const ms = ts < 10000000000 ? ts * 1000 : ts;
    const diffSec = Math.floor((Date.now() - ms) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 30) return `${diffDay}d ago`;
    const diffMonth = Math.floor(diffDay / 30);
    if (diffMonth < 12) return `${diffMonth}mo ago`;
    return `${Math.floor(diffDay / 365)}y ago`;
}

function defaultClears(): PlayerClearsMap {
    return {
        all: { clear: 0, fr: 0, pm: 0, total: 0 },
        pst: { clear: 0, fr: 0, pm: 0, total: 0 },
        prs: { clear: 0, fr: 0, pm: 0, total: 0 },
        ftr: { clear: 0, fr: 0, pm: 0, total: 0 },
        byd: { clear: 0, fr: 0, pm: 0, total: 0 },
        etr: { clear: 0, fr: 0, pm: 0, total: 0 },
    };
}

function mapPlayerRow(r: any, playCount: number, songTitles: Record<string, string>): AdminPlayerItem {
    const isPasswordEmpty = !r.password || r.password === '';
    const isBanFlagSet = r.ban_flag && String(r.ban_flag).trim() !== '' && String(r.ban_flag) !== '0';
    const isBanned = Boolean(isPasswordEmpty || isBanFlagSet);
    const emailStr = String(r.email || '').trim().toLowerCase();
    const isMockAccount = emailStr.endsWith('@celest.local') || (Number(r.user_id) >= 2000000 && Number(r.user_id) <= 2000004);

    let joinTs = 0;
    const parsed = parseInt(String(r.join_date || '0'), 10);
    if (!isNaN(parsed) && parsed > 0) {
        joinTs = parsed < 10000000000 ? parsed * 1000 : parsed;
    }

    const pttVal = typeof r.rating_ptt === 'number' ? r.rating_ptt : (Number(r.rating_ptt) || 0);
    const pttFormatted = (pttVal > 100 ? (pttVal / 100).toFixed(2) : pttVal.toFixed(3));
    const charId = r.character_id ?? 0;

    let recentPlay = null;
    if (r.song_id && r.time_played) {
        const sc = r.score ?? 0;
        recentPlay = {
            songId: r.song_id,
            songTitle: songTitles[r.song_id] || r.song_id,
            difficulty: r.difficulty ?? 2,
            difficultyCode: difficultyCode(r.difficulty ?? 2),
            score: sc,
            scoreFormatted: formatScore(sc),
            grade: grade(sc),
            clearType: r.clear_type ?? 0,
            timePlayed: r.time_played,
            relativeTime: formatRelativeTime(r.time_played),
        };
    }

    return {
        userId: r.user_id,
        name: r.name || `User ${r.user_id}`,
        userCode: r.user_code || String(r.user_id).padStart(9, '0'),
        email: r.email || '',
        ratingPtt: Number(pttVal.toFixed(3)),
        ratingPttFormatted: pttFormatted,
        worldRank: null, // assigned after sorting
        memories: r.ticket ?? 0,
        characterId: charId,
        characterAvatar: `/storage/characters/${charId}_icon.png`,
        isBanned,
        isMockAccount,
        banReason: isBanFlagSet ? String(r.ban_flag) : (isPasswordEmpty ? 'Account locked' : null),
        joinDate: joinTs > 0 ? new Date(joinTs).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
        joinTimestamp: joinTs,
        playCount,
        clears: r.clears || defaultClears(),
        recentPlay,
    };
}

function assignWorldRanks(players: AdminPlayerItem[]): void {
    const sorted = [...players].sort((a, b) => b.ratingPtt - a.ratingPtt);
    let rank = 1;
    for (const p of sorted) {
        if (p.ratingPtt > 0) {
            p.worldRank = rank++;
        } else {
            p.worldRank = null;
        }
    }
}

export default defineEventHandler(async () => {
    const { songTitles } = await loadSongMetadataLookup();

    // 1. Try fetching from VPS live database first (Option A)
    try {
        const vpsRows = await fetchAdminPlayersFromVps();
        if (vpsRows && vpsRows.length > 0) {
            const players: AdminPlayerItem[] = vpsRows.map(r => mapPlayerRow(r, r.play_count ?? 0, songTitles));
            assignWorldRanks(players);

            return {
                success: true,
                total: players.length,
                activeCount: players.filter(p => !p.isBanned).length,
                bannedCount: players.filter(p => p.isBanned).length,
                players,
                source: 'vps',
            };
        }
    } catch (vpsErr) {
        console.warn('[Admin Players] VPS fetch error, falling back to local DB:', vpsErr);
    }

    // 2. Fallback to local database
    const dbPath = getServerDbPath();
    if (!dbPath) {
        return { success: false, error: 'Server database not found', players: [] };
    }

    try {
        const db = new Database(dbPath, { readonly: true });
        const scoreCounts = new Map<number, number>();
        try {
            const counts = db.prepare('SELECT user_id, COUNT(*) as c FROM best_score GROUP BY user_id').all() as Array<{ user_id: number; c: number }>;
            for (const row of counts) {
                scoreCounts.set(row.user_id, row.c);
            }
        } catch {}

        // Compute clears map locally
        const clearsMap: Record<number, PlayerClearsMap> = {};
        try {
            const clearRows = db.prepare('SELECT user_id, difficulty, clear_type, COUNT(*) as c FROM best_score GROUP BY user_id, difficulty, clear_type').all() as Array<{ user_id: number; difficulty: number; clear_type: number; c: number }>;
            for (const r of clearRows) {
                const uid = r.user_id;
                if (!clearsMap[uid]) clearsMap[uid] = defaultClears();
                const diffKey = ({ 0: 'pst', 1: 'prs', 2: 'ftr', 3: 'byd', 4: 'etr' } as any)[r.difficulty];
                if (r.clear_type === 3) {
                    clearsMap[uid].all.pm += r.c;
                    if (diffKey) (clearsMap[uid] as any)[diffKey].pm += r.c;
                } else if (r.clear_type === 2) {
                    clearsMap[uid].all.fr += r.c;
                    if (diffKey) (clearsMap[uid] as any)[diffKey].fr += r.c;
                } else if ([1, 4, 5].includes(r.clear_type)) {
                    clearsMap[uid].all.clear += r.c;
                    if (diffKey) (clearsMap[uid] as any)[diffKey].clear += r.c;
                }
                if (r.clear_type >= 1) {
                    clearsMap[uid].all.total += r.c;
                    if (diffKey) (clearsMap[uid] as any)[diffKey].total += r.c;
                }
            }
        } catch {}

        const rows = db.prepare(`
            SELECT 
                user_id, name, password, join_date, user_code, rating_ptt, 
                character_id, ticket, email, ban_flag,
                song_id, difficulty, score, clear_type, time_played
            FROM user
            ORDER BY rating_ptt DESC, user_id ASC
        `).all() as any[];

        db.close();

        const players: AdminPlayerItem[] = rows.map(r => {
            r.clears = clearsMap[r.user_id] || defaultClears();
            return mapPlayerRow(r, scoreCounts.get(r.user_id) ?? 0, songTitles);
        });
        assignWorldRanks(players);

        return {
            success: true,
            total: players.length,
            activeCount: players.filter(p => !p.isBanned).length,
            bannedCount: players.filter(p => p.isBanned).length,
            players,
            source: 'local',
        };
    } catch (err: any) {
        return {
            success: false,
            error: err.message || 'Failed to fetch player list',
            players: [],
        };
    }
});
