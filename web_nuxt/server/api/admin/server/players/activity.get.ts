import { defineEventHandler, getQuery, createError } from 'h3';
// @ts-ignore: better-sqlite3 uses export = Database CommonJS syntax
import Database from 'better-sqlite3';
import fs from 'fs';
import { getServerDbPath, getServerSonglistPath } from '../../../../utils/server-paths.ts';
import { fetchPlayerActivityFromVps } from '../../../../utils/vps-sync.ts';
import { grade } from '../../../../../app/utils/arcaea-rating.ts';

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

function clearTypeToLamp(clearType: number): { label: string; short: string; color: string } {
    switch (clearType) {
        case 3: return { label: 'Pure Memory', short: 'PM', color: '#ffd76a' };
        case 2: return { label: 'Full Recall', short: 'FR', color: '#acff82' };
        case 1: return { label: 'Normal Clear', short: 'Clear', color: '#60a5fa' };
        case 4: return { label: 'Easy Clear', short: 'Easy', color: '#38bdf8' };
        case 5: return { label: 'Hard Clear', short: 'Hard', color: '#f87171' };
        default: return { label: 'Track Lost', short: 'Lost', color: '#9a99a8' };
    }
}

function formatScore(s: number): string {
    const padded = String(s).padStart(8, '0');
    return `${padded.slice(0, 2)}'${padded.slice(2, 5)}'${padded.slice(5, 8)}`;
}

function formatRelativeTime(ts: number): string {
    if (!ts) return '—';
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

function formatDateTime(ts: number): string {
    if (!ts) return '—';
    const ms = ts < 10000000000 ? ts * 1000 : ts;
    const d = new Date(ms);
    return d.toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const userId = query.userId ? Number(query.userId) : null;

    if (!userId) {
        throw createError({ statusCode: 400, statusMessage: 'Valid userId parameter required' });
    }

    // Load song titles
    const songlistPath = getServerSonglistPath();
    const songTitles: Record<string, string> = {};
    if (songlistPath && fs.existsSync(songlistPath)) {
        try {
            const raw = JSON.parse(fs.readFileSync(songlistPath, 'utf-8'));
            for (const s of raw.songs || []) {
                songTitles[s.id] = s.title_localized?.en || s.id;
            }
        } catch {}
    }

    // 1. Try VPS first
    try {
        const vpsData = await fetchPlayerActivityFromVps(userId);
        if (vpsData && vpsData.user) {
            const u = vpsData.user;
            const logins = (vpsData.logins || []).map(l => ({
                loginTime: l.login_time,
                formattedTime: formatDateTime(l.login_time),
                relativeTime: formatRelativeTime(l.login_time),
                ipAddress: l.login_ip || '—',
                device: l.login_device || '—',
            }));

            const recentPlays = (vpsData.recentPlays || []).map(p => {
                const lamp = clearTypeToLamp(p.clear_type);
                return {
                    songId: p.song_id,
                    songTitle: songTitles[p.song_id] || p.song_id,
                    difficulty: p.difficulty,
                    difficultyCode: difficultyCode(p.difficulty),
                    score: p.score,
                    scoreFormatted: formatScore(p.score),
                    grade: grade(p.score),
                    clearType: p.clear_type,
                    lamp,
                    rating: p.rating,
                    timePlayed: p.time_played,
                    formattedTime: formatDateTime(p.time_played),
                    relativeTime: formatRelativeTime(p.time_played),
                };
            });

            return {
                success: true,
                user: {
                    userId: u.user_id,
                    name: u.name,
                    userCode: u.user_code,
                    email: u.email || '',
                    ratingPtt: u.rating_ptt,
                    characterId: u.character_id ?? 0,
                    characterAvatar: `/storage/characters/${u.character_id ?? 0}_icon.png`,
                    memories: u.ticket ?? 0,
                    joinDate: u.join_date ? formatDateTime(Number(u.join_date)) : '—',
                    isBanned: Boolean(!u.password || (u.ban_flag && String(u.ban_flag) !== '0')),
                    banReason: u.ban_flag || null,
                },
                logins,
                recentPlays,
                source: 'vps',
            };
        }
    } catch (vpsErr) {
        console.warn('[Player Activity] VPS fetch error, falling back to local DB:', vpsErr);
    }

    // 2. Fallback to local DB
    const dbPath = getServerDbPath();
    if (!dbPath) {
        throw createError({ statusCode: 500, statusMessage: 'Database not available' });
    }

    try {
        const db = new Database(dbPath, { readonly: true });
        const user = db.prepare('SELECT user_id, name, user_code, email, rating_ptt, character_id, ticket, join_date, ban_flag, password FROM user WHERE user_id = ?').get(userId) as any;
        if (!user) {
            db.close();
            throw createError({ statusCode: 404, statusMessage: 'Player not found' });
        }

        const loginsRaw = db.prepare('SELECT login_time, login_ip, login_device FROM login WHERE user_id = ? ORDER BY login_time DESC LIMIT 50').all(userId) as any[];
        const playsRaw = db.prepare('SELECT song_id, difficulty, score, clear_type, time_played, rating FROM recent30 WHERE user_id = ? ORDER BY time_played DESC LIMIT 30').all(userId) as any[];
        db.close();

        const logins = loginsRaw.map(l => ({
            loginTime: l.login_time,
            formattedTime: formatDateTime(l.login_time),
            relativeTime: formatRelativeTime(l.login_time),
            ipAddress: l.login_ip || '—',
            device: l.login_device || '—',
        }));

        const recentPlays = playsRaw.map(p => {
            const lamp = clearTypeToLamp(p.clear_type);
            return {
                songId: p.song_id,
                songTitle: songTitles[p.song_id] || p.song_id,
                difficulty: p.difficulty,
                difficultyCode: difficultyCode(p.difficulty),
                score: p.score,
                scoreFormatted: formatScore(p.score),
                grade: grade(p.score),
                clearType: p.clear_type,
                lamp,
                rating: p.rating,
                timePlayed: p.time_played,
                formattedTime: formatDateTime(p.time_played),
                relativeTime: formatRelativeTime(p.time_played),
            };
        });

        return {
            success: true,
            user: {
                userId: user.user_id,
                name: user.name,
                userCode: user.user_code,
                email: user.email || '',
                ratingPtt: user.rating_ptt,
                characterId: user.character_id ?? 0,
                characterAvatar: `/storage/characters/${user.character_id ?? 0}_icon.png`,
                memories: user.ticket ?? 0,
                joinDate: user.join_date ? formatDateTime(Number(user.join_date)) : '—',
                isBanned: Boolean(!user.password || (user.ban_flag && String(user.ban_flag) !== '0')),
                banReason: user.ban_flag || null,
            },
            logins,
            recentPlays,
            source: 'local',
        };
    } catch (err: any) {
        if (err.statusCode) throw err;
        throw createError({ statusCode: 500, statusMessage: err.message || 'Failed to fetch player activity' });
    }
});

