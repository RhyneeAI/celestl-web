import { defineEventHandler } from 'h3';
import fs from 'fs';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { getServerDbPath, getServerSonglistPath } from '../../../../utils/server-paths.ts';

const execFileAsync = promisify(execFile);

export default defineEventHandler(async () => {
    // 1. Check daemon status on port 8765
    let isRunning = false;
    let pid: number | null = null;
    try {
        const { stdout } = await execFileAsync('ss', ['-tulpn']);
        const match = stdout.match(/:8765.*?pid=(\d+)/);
        if (match && match[1]) {
            isRunning = true;
            pid = parseInt(match[1], 10);
        }
    } catch {
        // ss might not be available or exit non-zero
    }

    // 2. Database statistics
    const dbPath = getServerDbPath();
    let dbStats = {
        exists: false,
        path: dbPath || 'Not found',
        sizeBytes: 0,
        sizeFormatted: '0 B',
        lastModified: '—',
    };

    if (dbPath && fs.existsSync(dbPath)) {
        const stat = fs.statSync(dbPath);
        const mb = (stat.size / (1024 * 1024)).toFixed(2);
        dbStats = {
            exists: true,
            path: dbPath,
            sizeBytes: stat.size,
            sizeFormatted: `${mb} MB`,
            lastModified: new Date(stat.mtimeMs).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        };
    }

    // 3. Songlist statistics
    const songlistPath = getServerSonglistPath();
    let songlistStats = {
        exists: false,
        path: songlistPath || 'Not found',
        totalSongs: 0,
        totalCharts: 0,
        lastModified: '—',
    };

    if (songlistPath && fs.existsSync(songlistPath)) {
        try {
            const stat = fs.statSync(songlistPath);
            const content = JSON.parse(fs.readFileSync(songlistPath, 'utf-8'));
            const songs = content.songs || [];
            let chartCount = 0;
            for (const s of songs) {
                chartCount += (s.difficulties || []).length;
            }
            songlistStats = {
                exists: true,
                path: songlistPath,
                totalSongs: songs.length,
                totalCharts: chartCount,
                lastModified: new Date(stat.mtimeMs).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            };
        } catch {}
    }

    // 4. VPS Connection status
    const vpsKey = '/home/luhung/.ssh/sefeo-biznet.pem';
    const hasSshKey = fs.existsSync(vpsKey);

    return {
        success: true,
        daemon: {
            isRunning,
            pid,
            port: 8765,
        },
        database: dbStats,
        songlist: songlistStats,
        vps: {
            host: '139.190.96.194',
            user: 'sefeo-english',
            hasSshKey,
        },
    };
});

