import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { getServerSonglistPath, getServerSongsDir, getRecalculateScriptPath, getValidateAffScriptPath } from './server-paths.ts';

const execFileAsync = promisify(execFile);

const VPS_USER = 'sefeo-english';
const VPS_HOST = '139.190.96.194';
const VPS_PEM_KEY = '/home/luhung/.ssh/sefeo-biznet.pem';
const VPS_SONGS_DIR = '/home/sefeo-english/celest-server/database/songs';
const VPS_DB_PATH = '/home/sefeo-english/celest-server/database/arcaea_database.db';

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
 * Save .aff chart content locally and optionally push to VPS, bumping song.date for hot reload.
 */
export async function saveChartAff(
    songId: string,
    ratingClass: number,
    content: string,
    deployVps: boolean = true
): Promise<VpsSyncResult & { updated_at: number; size: number }> {
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

    // If VPS deploy is disabled, save locally only
    if (!deployVps) {
        return {
            success: true,
            synced_vps: false,
            message: 'Saved locally on server (VPS deployment skipped).',
            updated_at: now,
            size,
        };
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
 * Validate .aff chart content against Points 3, 4, and 5 integrity rules.
 */
export async function validateChartAff(songId: string, ratingClass: number, content: string): Promise<any> {
    const scriptPath = getValidateAffScriptPath();
    if (!scriptPath) {
        throw new Error('validate_single_aff.py script not found.');
    }
    const pyBin = fs.existsSync('/home/luhung/.venvs/arcaea-server/bin/python')
        ? '/home/luhung/.venvs/arcaea-server/bin/python'
        : 'python3';

    return new Promise((resolve, reject) => {
        const proc = execFile(
            pyBin,
            [scriptPath, '--song-id', songId, '--rating-class', String(ratingClass)],
            { maxBuffer: 10 * 1024 * 1024 },
            (error, stdout, stderr) => {
                if (stdout) {
                    try {
                        const parsed = JSON.parse(stdout);
                        resolve(parsed);
                        return;
                    } catch (e) {
                        // ignore parse error, continue
                    }
                }
                if (error && !stdout) {
                    reject(new Error(stderr || error.message || 'Validation process failed'));
                } else {
                    reject(new Error('Invalid output from validator: ' + stdout));
                }
            }
        );
        if (proc.stdin) {
            proc.stdin.write(content);
            proc.stdin.end();
        }
    });
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

/**
 * Generic helper to execute a Python script on VPS passing JSON payload via base64.
 */
export async function runVpsPythonWithPayload(pyScript: string, payload: any): Promise<VpsSyncResult> {
    if (!fs.existsSync(VPS_PEM_KEY)) {
        return { success: true, synced_vps: false, message: 'VPS SSH key not found, skipped.' };
    }
    const b64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const remoteCmd = `python3 -c "import base64, json, sys, sqlite3; ${pyScript}" "${b64Payload}"`;
    try {
        const { stdout } = await execFileAsync('ssh', [
            '-i', VPS_PEM_KEY,
            '-o', 'BatchMode=yes',
            '-o', 'StrictHostKeyChecking=no',
            '-o', 'ConnectTimeout=10',
            `${VPS_USER}@${VPS_HOST}`,
            remoteCmd,
        ]);
        return { success: true, synced_vps: true, message: stdout.trim() };
    } catch (err: any) {
        console.error('[VPS Sync Error]:', err);
        return { success: true, synced_vps: false, error: err.message || 'Failed to sync to VPS' };
    }
}

/**
 * Sync created Present to VPS celest-server database.
 */
export async function syncPresentCreateToVps(present: {
    presentId: string;
    expireTs: number;
    description: string;
    target: 'all' | 'single';
    userId?: number;
    items: Array<{ itemId: string; type: string; amount: number }>;
}): Promise<VpsSyncResult> {
    const pyScript = `data = json.loads(base64.b64decode(sys.argv[1]).decode('utf-8'))
conn = sqlite3.connect('${VPS_DB_PATH}')
c = conn.cursor()
c.execute('INSERT OR REPLACE INTO present VALUES (?, ?, ?)', (data['presentId'], data['expireTs'], data['description']))
for it in data['items']:
    c.execute('INSERT OR REPLACE INTO present_item VALUES (?, ?, ?, ?)', (data['presentId'], it['itemId'], it['type'], it['amount']))
if data['target'] == 'all':
    users = [r[0] for r in c.execute('SELECT user_id FROM user').fetchall()]
    for uid in users:
        c.execute('INSERT OR IGNORE INTO user_present VALUES (?, ?)', (uid, data['presentId']))
elif data.get('userId'):
    c.execute('INSERT OR IGNORE INTO user_present VALUES (?, ?)', (data['userId'], data['presentId']))
conn.commit()
print('Present synced to VPS')`;
    return runVpsPythonWithPayload(pyScript.replace(/\n/g, '; '), present);
}

/**
 * Sync deleted Present to VPS celest-server database.
 */
export async function syncPresentDeleteToVps(presentId: string): Promise<VpsSyncResult> {
    const pyScript = `data = json.loads(base64.b64decode(sys.argv[1]).decode('utf-8'))
conn = sqlite3.connect('${VPS_DB_PATH}')
c = conn.cursor()
c.execute('DELETE FROM present WHERE present_id = ?', (data['presentId'],))
c.execute('DELETE FROM present_item WHERE present_id = ?', (data['presentId'],))
c.execute('DELETE FROM user_present WHERE present_id = ?', (data['presentId'],))
conn.commit()
print('Present deleted on VPS')`;
    return runVpsPythonWithPayload(pyScript.replace(/\n/g, '; '), { presentId });
}

/**
 * Sync created Redeem Code to VPS celest-server database.
 */
export async function syncRedeemCreateToVps(redeem: {
    code: string;
    type: number;
    items: Array<{ itemId: string; type: string; amount: number }>;
}): Promise<VpsSyncResult> {
    const pyScript = `data = json.loads(base64.b64decode(sys.argv[1]).decode('utf-8'))
conn = sqlite3.connect('${VPS_DB_PATH}')
c = conn.cursor()
c.execute('INSERT OR REPLACE INTO redeem VALUES (?, ?)', (data['code'], data['type']))
for it in data['items']:
    c.execute('INSERT OR REPLACE INTO redeem_item VALUES (?, ?, ?, ?)', (data['code'], it['itemId'], it['type'], it['amount']))
conn.commit()
print('Redeem synced to VPS')`;
    return runVpsPythonWithPayload(pyScript.replace(/\n/g, '; '), redeem);
}

/**
 * Sync deleted Redeem Code to VPS celest-server database.
 */
export async function syncRedeemDeleteToVps(code: string): Promise<VpsSyncResult> {
    const pyScript = `data = json.loads(base64.b64decode(sys.argv[1]).decode('utf-8'))
conn = sqlite3.connect('${VPS_DB_PATH}')
c = conn.cursor()
c.execute('DELETE FROM redeem WHERE code = ?', (data['code'],))
c.execute('DELETE FROM redeem_item WHERE code = ?', (data['code'],))
c.execute('DELETE FROM user_redeem WHERE code = ?', (data['code'],))
conn.commit()
print('Redeem deleted on VPS')`;
    return runVpsPythonWithPayload(pyScript.replace(/\n/g, '; '), { code });
}

/**
 * Sync Player Memories update to VPS celest-server database.
 */
export async function syncPlayerMemoriesToVps(userId: number, memories: number): Promise<VpsSyncResult> {
    const pyScript = `data = json.loads(base64.b64decode(sys.argv[1]).decode('utf-8'))
conn = sqlite3.connect('${VPS_DB_PATH}')
c = conn.cursor()
c.execute('UPDATE user SET ticket = ? WHERE user_id = ?', (data['memories'], data['userId']))
conn.commit()
print('Player memories updated on VPS')`;
    return runVpsPythonWithPayload(pyScript.replace(/\n/g, '; '), { userId, memories });
}

/**
 * Sync Player Ban update to VPS celest-server database.
 */
export async function syncPlayerBanToVps(userId: number, isBanned: boolean, banReason: string | null): Promise<VpsSyncResult> {
    const pyScript = `data = json.loads(base64.b64decode(sys.argv[1]).decode('utf-8'))
conn = sqlite3.connect('${VPS_DB_PATH}')
c = conn.cursor()
c.execute('UPDATE user SET ban_flag = ? WHERE user_id = ?', (1 if data['isBanned'] else 0, data['userId']))
conn.commit()
print('Player ban status updated on VPS')`;
    return runVpsPythonWithPayload(pyScript.replace(/\n/g, '; '), { userId, isBanned, banReason });
}

/**
 * Sync Player Password update to VPS celest-server database.
 */
export async function syncPlayerPasswordToVps(userId: number, passwordHash: string): Promise<VpsSyncResult> {
    const pyScript = `data = json.loads(base64.b64decode(sys.argv[1]).decode('utf-8'))
conn = sqlite3.connect('${VPS_DB_PATH}')
c = conn.cursor()
c.execute('UPDATE user SET password = ? WHERE user_id = ?', (data['passwordHash'], data['userId']))
conn.commit()
print('Player password updated on VPS')`;
    return runVpsPythonWithPayload(pyScript.replace(/\n/g, '; '), { userId, passwordHash });
}

/**
 * Sync Player Wipe Scores to VPS celest-server database.
 */
export async function syncPlayerWipeScoresToVps(userId: number): Promise<VpsSyncResult> {
    const pyScript = `data = json.loads(base64.b64decode(sys.argv[1]).decode('utf-8'))
conn = sqlite3.connect('${VPS_DB_PATH}')
c = conn.cursor()
c.execute('DELETE FROM best_score WHERE user_id = ?', (data['userId'],))
c.execute('DELETE FROM recent30 WHERE user_id = ?', (data['userId'],))
c.execute('UPDATE user SET rating_ptt = 0 WHERE user_id = ?', (data['userId'],))
conn.commit()
print('Player scores wiped on VPS')`;
    const res = await runVpsPythonWithPayload(pyScript.replace(/\n/g, '; '), { userId });
    await recalculateRatingsOnVps();
    return res;
}


