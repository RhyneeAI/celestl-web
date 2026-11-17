import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { getServerSonglistPath, getServerSongsDir, getRecalculateScriptPath } from './server-paths.ts';

const execFileAsync = promisify(execFile);

const VPS_USER = 'sefeo-english';
const VPS_HOST = '139.190.96.194';
const VPS_PEM_KEY = '/home/luhung/.ssh/sefeo-biznet.pem';
const VPS_SONGS_DIR = '/home/sefeo-english/celest-server/database/songs';

export interface VpsSyncResult {
    success: boolean;
    synced_vps: boolean;
    message?: string;
    error?: string;
}

/**
 * Push local songlist JSON file to VPS celest-server container volume.
 */
export async function syncSonglistToVps(localSonglistPath: string): Promise<VpsSyncResult> {
    if (!fs.existsSync(VPS_PEM_KEY)) {
        return {
            success: true,
            synced_vps: false,
            message: 'VPS SSH key not found, saved locally only.',
        };
    }

    try {
        const dest = `${VPS_USER}@${VPS_HOST}:${VPS_SONGS_DIR}/songlist`;
        await execFileAsync('scp', [
            '-i', VPS_PEM_KEY,
            '-o', 'BatchMode=yes',
            '-o', 'StrictHostKeyChecking=no',
            '-o', 'ConnectTimeout=5',
            localSonglistPath,
            dest,
        ]);

        return {
            success: true,
            synced_vps: true,
            message: 'Songlist successfully pushed to VPS celest-server.',
        };
    } catch (err: any) {
        console.error('[VPS Sync Error] Failed to sync songlist to VPS:', err);
        return {
            success: true,
            synced_vps: false,
            error: err.message || 'Failed to connect to VPS',
        };
    }
}

/**
 * Fetch .aff chart content from VPS (falls back to local file if VPS unreachable).
 */
export async function fetchChartAff(songId: string, ratingClass: number): Promise<{ content: string; source: 'vps' | 'local'; size: number }> {
    const filename = `${ratingClass}.aff`;
    const songsDir = getServerSongsDir();
    const localPath = songsDir ? path.join(songsDir, songId, filename) : null;

    if (fs.existsSync(VPS_PEM_KEY)) {
        try {
            const vpsFilePath = `${VPS_SONGS_DIR}/${songId}/${filename}`;
            const { stdout } = await execFileAsync('ssh', [
                '-i', VPS_PEM_KEY,
                '-o', 'BatchMode=yes',
                '-o', 'StrictHostKeyChecking=no',
                '-o', 'ConnectTimeout=5',
                `${VPS_USER}@${VPS_HOST}`,
                `cat "${vpsFilePath}"`,
            ], { maxBuffer: 10 * 1024 * 1024 });

            if (stdout && stdout.length > 0) {
                return {
                    content: stdout,
                    source: 'vps',
                    size: Buffer.byteLength(stdout, 'utf-8'),
                };
            }
        } catch (vpsErr) {
            console.warn(`[VPS Fetch Warning] Could not fetch ${songId}/${filename} from VPS, falling back to local:`, vpsErr);
        }
    }

    if (localPath && fs.existsSync(localPath)) {
        const content = fs.readFileSync(localPath, 'utf-8');
        return {
            content,
            source: 'local',
            size: Buffer.byteLength(content, 'utf-8'),
        };
    }

    throw new Error(`Chart file '${filename}' for song '${songId}' not found on server or locally.`);
}

/**
 * Save .aff chart content locally and push to VPS, bumping song.date for hot reload.
 */
export async function saveChartAff(songId: string, ratingClass: number, content: string): Promise<VpsSyncResult & { updated_at: number; size: number }> {
    const filename = `${ratingClass}.aff`;
    const songsDir = getServerSongsDir();
    const songlistPath = getServerSonglistPath();

    if (!songsDir || !songlistPath) {
        throw new Error('Server songs directory or songlist not found.');
    }

    const songDir = path.join(songsDir, songId);
    if (!fs.existsSync(songDir)) {
        fs.mkdirSync(songDir, { recursive: true });
    }

    const localAffPath = path.join(songDir, filename);
    fs.writeFileSync(localAffPath, content, 'utf-8');
    const size = Buffer.byteLength(content, 'utf-8');

    // Update song.date timestamp in songlist for hot reload
    const now = Math.floor(Date.now() / 1000);
    try {
        const raw = JSON.parse(fs.readFileSync(songlistPath, 'utf-8'));
        const song = (raw.songs || []).find((s: any) => s.id === songId);
        if (song) {
            song.date = now;
            fs.writeFileSync(songlistPath, JSON.stringify(raw, null, 2), 'utf-8');
        }
    } catch (e) {
        console.warn('Could not update song.date in songlist:', e);
    }

    // Push .aff and songlist to VPS if SSH available
    let synced_vps = false;
    let message = 'Saved locally.';
    let error: string | undefined;

    if (fs.existsSync(VPS_PEM_KEY)) {
        try {
            const vpsSongDir = `${VPS_SONGS_DIR}/${songId}`;
            // Ensure target directory exists on VPS
            await execFileAsync('ssh', [
                '-i', VPS_PEM_KEY,
                '-o', 'BatchMode=yes',
                '-o', 'StrictHostKeyChecking=no',
                '-o', 'ConnectTimeout=5',
                `${VPS_USER}@${VPS_HOST}`,
                `mkdir -p "${vpsSongDir}"`,
            ]);

            // SCP .aff file
            await execFileAsync('scp', [
                '-i', VPS_PEM_KEY,
                '-o', 'BatchMode=yes',
                '-o', 'StrictHostKeyChecking=no',
                '-o', 'ConnectTimeout=5',
                localAffPath,
                `${VPS_USER}@${VPS_HOST}:${vpsSongDir}/${filename}`,
            ]);

            // SCP updated songlist for hot-reload date
            await execFileAsync('scp', [
                '-i', VPS_PEM_KEY,
                '-o', 'BatchMode=yes',
                '-o', 'StrictHostKeyChecking=no',
                '-o', 'ConnectTimeout=5',
                songlistPath,
                `${VPS_USER}@${VPS_HOST}:${VPS_SONGS_DIR}/songlist`,
            ]);

            synced_vps = true;
            message = 'Successfully deployed chart .aff and updated songlist on VPS celest-server.';
        } catch (err: any) {
            console.error('[VPS Aff Deploy Error]:', err);
            error = err.message || 'Failed to deploy to VPS';
        }
    }

    return {
        success: true,
        synced_vps,
        message,
        error,
        updated_at: now,
        size,
    };
}

/**
 * Execute atomic store price update on VPS celest-server database via SSH.
 */
export async function syncStoreUpdateToVps(
    purchaseName: string,
    price: number,
    origPrice: number,
    discountFrom: number,
    discountTo: number,
    discountReason: string
): Promise<VpsSyncResult> {
    if (!fs.existsSync(VPS_PEM_KEY)) {
        return {
            success: true,
            synced_vps: false,
            message: 'VPS SSH key not found, updated locally only.',
        };
    }

    try {
        const pyCode = "import sqlite3, sys; conn = sqlite3.connect('/home/sefeo-english/celest-server/database/arcaea_database.db'); c = conn.cursor(); c.execute('UPDATE purchase SET price=?, orig_price=?, discount_from=?, discount_to=?, discount_reason=? WHERE purchase_name=?', (int(sys.argv[1]), int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]), sys.argv[5], sys.argv[6])); conn.commit(); print('UPDATED:', c.rowcount)";
        const safeReason = discountReason.replace(/"/g, '\\"');
        const safeName = purchaseName.replace(/"/g, '\\"');
        const remoteCmd = `python3 -c "${pyCode}" "${price}" "${origPrice}" "${discountFrom}" "${discountTo}" "${safeReason}" "${safeName}"`;

        await execFileAsync('ssh', [
            '-i', VPS_PEM_KEY,
            '-o', 'BatchMode=yes',
            '-o', 'StrictHostKeyChecking=no',
            '-o', 'ConnectTimeout=5',
            `${VPS_USER}@${VPS_HOST}`,
            remoteCmd,
        ]);

        return {
            success: true,
            synced_vps: true,
            message: 'Store item price successfully synced to VPS celest-server database.',
        };
    } catch (err: any) {
        console.error('[VPS Store Sync Error]:', err);
        return {
            success: true,
            synced_vps: false,
            error: err.message || 'Failed to sync store item to VPS',
        };
    }
}

/**
 * Execute recalculate_ratings.py locally on ArcaeaServerFork database.
 */
export async function recalculateRatingsLocal(): Promise<{ success: boolean; output: string; error?: string }> {
    const scriptPath = getRecalculateScriptPath();
    if (!scriptPath) {
        return {
            success: false,
            output: '',
            error: 'recalculate_ratings.py script not found',
        };
    }

    const pyBin = fs.existsSync('/home/luhung/.venvs/arcaea-server/bin/python')
        ? '/home/luhung/.venvs/arcaea-server/bin/python'
        : 'python3';

    try {
        const { stdout } = await execFileAsync(pyBin, [scriptPath]);
        return {
            success: true,
            output: stdout.trim(),
        };
    } catch (err: any) {
        console.error('[Local Recalculate Error]:', err);
        return {
            success: false,
            output: '',
            error: err.message || 'Failed to recalculate ratings locally',
        };
    }
}

/**
 * Trigger recalculate_ratings.py inside container celest-arcaea-server on VPS.
 */
export async function recalculateRatingsOnVps(): Promise<VpsSyncResult> {
    if (!fs.existsSync(VPS_PEM_KEY)) {
        return {
            success: true,
            synced_vps: false,
            message: 'VPS SSH key not found, skipped VPS recalculation.',
        };
    }

    try {
        const remoteCmd = 'docker exec celest-arcaea-server python3 /app/tools/recalculate_ratings.py';
        const { stdout } = await execFileAsync('ssh', [
            '-i', VPS_PEM_KEY,
            '-o', 'BatchMode=yes',
            '-o', 'StrictHostKeyChecking=no',
            '-o', 'ConnectTimeout=10',
            `${VPS_USER}@${VPS_HOST}`,
            remoteCmd,
        ]);

        return {
            success: true,
            synced_vps: true,
            message: stdout.trim() || 'Ratings & PTT successfully recalculated on VPS.',
        };
    } catch (err: any) {
        console.error('[VPS Recalculate Error]:', err);
        return {
            success: true,
            synced_vps: false,
            error: err.message || 'Failed to recalculate ratings on VPS',
        };
    }
}


