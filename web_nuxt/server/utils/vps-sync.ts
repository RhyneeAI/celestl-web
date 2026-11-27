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

interface VpsCacheEntry<T> {
    data: T;
    expiresAt: number;
}
const vpsCache = new Map<string, VpsCacheEntry<any>>();

export function getVpsCache<T>(key: string): T | null {
    const entry = vpsCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        vpsCache.delete(key);
        return null;
    }
    return entry.data;
}

export function setVpsCache<T>(key: string, data: T, ttlMs: number = 8000): void {
    vpsCache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

export function clearVpsCache(): void {
    vpsCache.clear();
}

export interface VpsSyncResult {
    success: boolean;
    synced_vps: boolean;
    message?: string;
    error?: string;
}

/**
 * Fetch songlist JSON directly from live VPS celest-server (cached briefly).
 */
export async function fetchSonglistFromVps(): Promise<{ songs: any[] } | null> {
    const cacheKey = 'vps:songlist';
    const cached = getVpsCache<{ songs: any[] }>(cacheKey);
    if (cached) return cached;

    if (!fs.existsSync(VPS_PEM_KEY)) return null;

    try {
        const { stdout } = await execFileAsync('ssh', [
            '-i', VPS_PEM_KEY,
            '-o', 'BatchMode=yes',
            '-o', 'StrictHostKeyChecking=no',
            '-o', 'ConnectTimeout=5',
            `${VPS_USER}@${VPS_HOST}`,
            `cat "${VPS_SONGS_DIR}/songlist"`,
        ], { maxBuffer: 15 * 1024 * 1024 });

        if (stdout && stdout.trim()) {
            const parsed = JSON.parse(stdout);
            if (parsed && Array.isArray(parsed.songs)) {
                setVpsCache(cacheKey, parsed, 15000);
                return parsed;
            }
        }
    } catch (err) {
        console.warn('[VPS Fetch Warning] Could not fetch songlist from VPS:', err);
    }
    return null;
}

export interface VpsChartRow {
    song_id: string;
    name: string;
    rating_pst: number;
    rating_prs: number;
    rating_ftr: number;
    rating_byn: number;
    rating_etr: number;
}

/**
 * Fetch chart constants table directly from live VPS arcaea_database.db (cached briefly).
 */
export async function fetchChartsFromVps(): Promise<VpsChartRow[] | null> {
    const cacheKey = 'vps:charts';
    const cached = getVpsCache<VpsChartRow[]>(cacheKey);
    if (cached) return cached;

    const pyScript = `
conn = sqlite3.connect('${VPS_DB_PATH}')
conn.row_factory = sqlite3.Row
rows = conn.execute('SELECT song_id, name, rating_pst, rating_prs, rating_ftr, rating_byn, rating_etr FROM chart').fetchall()
print(json.dumps([dict(r) for r in rows]))
`;
    const res = await queryVpsPython<VpsChartRow[]>(pyScript);
    if (res && Array.isArray(res)) {
        setVpsCache(cacheKey, res, 30000);
        return res;
    }
    return null;
}

/**
 * Push local songlist JSON file to VPS celest-server container volume.
 */
export async function syncSonglistToVps(localSonglistPath: string): Promise<VpsSyncResult> {
    vpsCache.delete('vps:songlist');
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
            vpsCache.delete('vps:songlist');
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
    const fullScript = `import base64, json, sys, sqlite3, os\n${pyScript}`;
    const b64Script = Buffer.from(fullScript).toString('base64');
    const remoteCmd = `python3 -c "import base64; exec(base64.b64decode('${b64Script}').decode('utf-8'))" "${b64Payload}"`;
    try {
        const { stdout } = await execFileAsync('ssh', [
            '-i', VPS_PEM_KEY,
            '-o', 'BatchMode=yes',
            '-o', 'StrictHostKeyChecking=no',
            '-o', 'ConnectTimeout=10',
            `${VPS_USER}@${VPS_HOST}`,
            remoteCmd,
        ]);
        clearVpsCache();
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
    return runVpsPythonWithPayload(pyScript, present);
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
    return runVpsPythonWithPayload(pyScript, { presentId });
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
    return runVpsPythonWithPayload(pyScript, redeem);
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
    return runVpsPythonWithPayload(pyScript, { code });
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
    return runVpsPythonWithPayload(pyScript, { userId, memories });
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
    return runVpsPythonWithPayload(pyScript, { userId, isBanned, banReason });
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
    return runVpsPythonWithPayload(pyScript, { userId, passwordHash });
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
    const res = await runVpsPythonWithPayload(pyScript, { userId });
    await recalculateRatingsOnVps();
    return res;
}

/**
 * Sync Player Profile (nickname and optionally mock rating_ptt) to VPS celest-server database.
 */
export async function syncPlayerProfileToVps(
    userId: number,
    updates: { name?: string; ratingPtt?: number },
): Promise<VpsSyncResult> {
    const pyScript = `data = json.loads(base64.b64decode(sys.argv[1]).decode('utf-8'))
conn = sqlite3.connect('${VPS_DB_PATH}')
c = conn.cursor()
uid = data['userId']
row = c.execute('SELECT user_id, email FROM user WHERE user_id = ?', (uid,)).fetchone()
if not row:
    print(json.dumps({'ok': False, 'error': 'Player not found on VPS'}))
    sys.exit(0)
if data.get('name') is not None:
    dup = c.execute('SELECT user_id FROM user WHERE name = ? COLLATE NOCASE AND user_id != ?', (data['name'], uid)).fetchone()
    if dup:
        print(json.dumps({'ok': False, 'error': 'Nickname is already taken on VPS'}))
        sys.exit(0)
    c.execute('UPDATE user SET name = ? WHERE user_id = ?', (data['name'], uid))
if data.get('ratingPtt') is not None:
    email = (row[1] or '').strip().lower()
    if not (email.endswith('@celest.local') or (2000000 <= uid <= 2000004)):
        print(json.dumps({'ok': False, 'error': 'PTT adjustment is only allowed for generated mock accounts'}))
        sys.exit(0)
    c.execute('UPDATE user SET rating_ptt = ? WHERE user_id = ?', (float(data['ratingPtt']), uid))
conn.commit()
print(json.dumps({'ok': True}))`;

    const res = await runVpsPythonWithPayload(pyScript, {
        userId,
        name: updates.name ?? null,
        ratingPtt: updates.ratingPtt ?? null,
    });
    if (res.synced_vps && res.message) {
        try {
            const parsed = JSON.parse(res.message);
            if (!parsed.ok) {
                return {
                    success: false,
                    synced_vps: false,
                    error: parsed.error || 'VPS rejected profile update',
                };
            }
        } catch { }
    }
    return res;
}

/**
 * Fetch all Redeem Codes directly from VPS database.
 */
export async function fetchRedeemCodesFromVps(): Promise<any[] | null> {
    if (!fs.existsSync(VPS_PEM_KEY)) return null;

    const pyScript = `import sqlite3, json
conn = sqlite3.connect('${VPS_DB_PATH}')
c = conn.cursor()
redeems = c.execute('SELECT code, type FROM redeem').fetchall()
items = c.execute('SELECT code, item_id, type, amount FROM redeem_item').fetchall()
claims = c.execute('SELECT ur.code, ur.user_id, u.name FROM user_redeem ur LEFT JOIN user u ON ur.user_id = u.user_id').fetchall()
print(json.dumps({'redeems': redeems, 'items': items, 'claims': claims}))`;

    const b64Script = Buffer.from(pyScript).toString('base64');
    const remoteCmd = `python3 -c "import base64; exec(base64.b64decode('${b64Script}').decode('utf-8'))"`;

    try {
        const { stdout } = await execFileAsync('ssh', [
            '-i', VPS_PEM_KEY,
            '-o', 'BatchMode=yes',
            '-o', 'StrictHostKeyChecking=no',
            '-o', 'ConnectTimeout=5',
            `${VPS_USER}@${VPS_HOST}`,
            remoteCmd,
        ], { maxBuffer: 10 * 1024 * 1024 });

        const raw = JSON.parse(stdout.trim());
        const itemsMap = new Map<string, Array<{ itemId: string; type: string; amount: number }>>();
        for (const it of raw.items) {
            const [code, item_id, type, amount] = it;
            if (!itemsMap.has(code)) itemsMap.set(code, []);
            itemsMap.get(code)!.push({ itemId: item_id, type: type || 'single', amount: amount ?? 1 });
        }

        const claimsMap = new Map<string, Array<{ userId: number; name: string }>>();
        for (const cl of raw.claims) {
            const [code, user_id, name] = cl;
            if (!claimsMap.has(code)) claimsMap.set(code, []);
            claimsMap.get(code)!.push({ userId: user_id, name: name || `User ${user_id}` });
        }

        return raw.redeems.map((r: any[]) => {
            const code = r[0];
            const type = r[1] ?? 0;
            const claims = claimsMap.get(code) ?? [];
            return {
                code,
                type,
                typeLabel: type === 1 ? '1x per Player' : 'Single Use (Global)',
                items: itemsMap.get(code) ?? [],
                claimedCount: claims.length,
                claimedUsers: claims,
            };
        });
    } catch (err) {
        console.warn('[VPS Fetch Redeem Warning] Falling back to local database:', err);
        return null;
    }
}

/**
 * Fetch all Presents directly from VPS database.
 */
export async function fetchPresentsFromVps(): Promise<any[] | null> {
    if (!fs.existsSync(VPS_PEM_KEY)) return null;

    const pyScript = `import sqlite3, json
conn = sqlite3.connect('${VPS_DB_PATH}')
c = conn.cursor()
presents = c.execute('SELECT present_id, expire_ts, description FROM present ORDER BY expire_ts DESC').fetchall()
items = c.execute('SELECT present_id, item_id, type, amount FROM present_item').fetchall()
counts = c.execute('SELECT present_id, COUNT(DISTINCT user_id) as c FROM user_present GROUP BY present_id').fetchall()
print(json.dumps({'presents': presents, 'items': items, 'counts': counts}))`;

    const b64Script = Buffer.from(pyScript).toString('base64');
    const remoteCmd = `python3 -c "import base64; exec(base64.b64decode('${b64Script}').decode('utf-8'))"`;

    try {
        const { stdout } = await execFileAsync('ssh', [
            '-i', VPS_PEM_KEY,
            '-o', 'BatchMode=yes',
            '-o', 'StrictHostKeyChecking=no',
            '-o', 'ConnectTimeout=5',
            `${VPS_USER}@${VPS_HOST}`,
            remoteCmd,
        ], { maxBuffer: 10 * 1024 * 1024 });

        const raw = JSON.parse(stdout.trim());
        const itemsMap = new Map<string, Array<{ itemId: string; type: string; amount: number }>>();
        for (const it of raw.items) {
            const [pid, item_id, type, amount] = it;
            if (!itemsMap.has(pid)) itemsMap.set(pid, []);
            itemsMap.get(pid)!.push({ itemId: item_id, type: type || 'single', amount: amount ?? 1 });
        }

        const countMap = new Map<string, number>();
        for (const cnt of raw.counts) {
            countMap.set(cnt[0], cnt[1]);
        }

        const now = Date.now();
        return raw.presents.map((p: any[]) => {
            const [presentId, expireTs, description] = p;
            const exp = expireTs ? Number(expireTs) : 0;
            return {
                presentId,
                description: description || '',
                expireTs: exp,
                expireDate: exp ? new Date(exp).toISOString().replace('T', ' ').slice(0, 16) : 'Never',
                isExpired: exp > 0 && exp < now,
                deliveredCount: countMap.get(presentId) ?? 0,
                items: itemsMap.get(presentId) ?? [],
            };
        });
    } catch (err) {
        console.warn('[VPS Fetch Presents Warning] Falling back to local database:', err);
        return null;
    }
}

/**
 * Generic helper to execute a Python query script on VPS and return parsed JSON data.
 */
export async function queryVpsPython<T = any>(pyScript: string, payload?: any): Promise<T | null> {
    if (!fs.existsSync(VPS_PEM_KEY)) return null;

    const b64Payload = payload !== undefined ? Buffer.from(JSON.stringify(payload)).toString('base64') : '';
    const fullScript = `import base64, json, sys, sqlite3, os\n${pyScript}`;
    const b64Script = Buffer.from(fullScript).toString('base64');
    const remoteCmd = b64Payload
        ? `python3 -c "import base64; exec(base64.b64decode('${b64Script}').decode('utf-8'))" "${b64Payload}"`
        : `python3 -c "import base64; exec(base64.b64decode('${b64Script}').decode('utf-8'))"`;

    try {
        const { stdout } = await execFileAsync('ssh', [
            '-i', VPS_PEM_KEY,
            '-o', 'BatchMode=yes',
            '-o', 'StrictHostKeyChecking=no',
            '-o', 'ConnectTimeout=5',
            `${VPS_USER}@${VPS_HOST}`,
            remoteCmd,
        ], { maxBuffer: 15 * 1024 * 1024 });

        if (!stdout || !stdout.trim()) return null;
        return JSON.parse(stdout.trim()) as T;
    } catch (err: any) {
        console.warn('[VPS Query Warning]:', err.message || err);
        return null;
    }
}

/**
 * Execute a read-only SQL query on the VPS database and return rows as objects.
 */
export async function queryVpsDatabase<T = any>(sql: string, params: any[] = []): Promise<T[] | null> {
    const pyScript = `
payload = json.loads(base64.b64decode(sys.argv[1]).decode('utf-8'))
conn = sqlite3.connect('${VPS_DB_PATH}')
conn.row_factory = sqlite3.Row
rows = conn.execute(payload['sql'], payload.get('params', [])).fetchall()
print(json.dumps([dict(r) for r in rows]))
`;
    return queryVpsPython<T[]>(pyScript, { sql, params });
}

/**
 * Fetch a single player from VPS by user_id, user_code, or username.
 */
export async function fetchPlayerFromVps(identifier: string | number, skipCache: boolean = false): Promise<any | null> {
    const cacheKey = `player:${identifier}`;
    if (!skipCache) {
        const cached = getVpsCache<any>(cacheKey);
        if (cached !== null) return cached;
    }

    const pyScript = `
payload = json.loads(base64.b64decode(sys.argv[1]).decode('utf-8'))
val = payload['identifier']
conn = sqlite3.connect('${VPS_DB_PATH}')
conn.row_factory = sqlite3.Row
c = conn.cursor()
row = None
if isinstance(val, int) or (isinstance(val, str) and val.isdigit() and len(val) <= 7):
    row = c.execute('SELECT user_id, name, user_code, rating_ptt, character_id, ticket, email FROM user WHERE user_id = ? LIMIT 1', (int(val),)).fetchone()
if not row:
    row = c.execute('SELECT user_id, name, user_code, rating_ptt, character_id, ticket, email FROM user WHERE name = ? COLLATE NOCASE OR user_code = ? LIMIT 1', (str(val), str(val))).fetchone()
print(json.dumps(dict(row) if row else None))
`;
    const res = await queryVpsPython<any>(pyScript, { identifier });
    if (res) {
        setVpsCache(cacheKey, res, 10000);
    }
    return res;
}

/**
 * Fetch all players from VPS for Admin Players list.
 */
export async function fetchAdminPlayersFromVps(): Promise<any[] | null> {
    const cacheKey = 'admin:players';
    const cached = getVpsCache<any[]>(cacheKey);
    if (cached) return cached;

    const pyScript = `
conn = sqlite3.connect('${VPS_DB_PATH}')
conn.row_factory = sqlite3.Row
c = conn.cursor()

counts = {r[0]: r[1] for r in c.execute('SELECT user_id, COUNT(*) FROM best_score GROUP BY user_id').fetchall()}

clear_rows = c.execute('SELECT user_id, difficulty, clear_type, COUNT(*) as c FROM best_score GROUP BY user_id, difficulty, clear_type').fetchall()
clears_map = {}
for r in clear_rows:
    uid, diff, ctype, count = r['user_id'], r['difficulty'], r['clear_type'], r['c']
    if uid not in clears_map:
        clears_map[uid] = {
            'all': {'clear': 0, 'fr': 0, 'pm': 0, 'total': 0},
            'pst': {'clear': 0, 'fr': 0, 'pm': 0, 'total': 0},
            'prs': {'clear': 0, 'fr': 0, 'pm': 0, 'total': 0},
            'ftr': {'clear': 0, 'fr': 0, 'pm': 0, 'total': 0},
            'byd': {'clear': 0, 'fr': 0, 'pm': 0, 'total': 0},
            'etr': {'clear': 0, 'fr': 0, 'pm': 0, 'total': 0},
        }
    diff_key = {0: 'pst', 1: 'prs', 2: 'ftr', 3: 'byd', 4: 'etr'}.get(diff)
    if ctype == 3:
        clears_map[uid]['all']['pm'] += count
        if diff_key: clears_map[uid][diff_key]['pm'] += count
    elif ctype == 2:
        clears_map[uid]['all']['fr'] += count
        if diff_key: clears_map[uid][diff_key]['fr'] += count
    elif ctype in (1, 4, 5):
        clears_map[uid]['all']['clear'] += count
        if diff_key: clears_map[uid][diff_key]['clear'] += count
    if ctype >= 1:
        clears_map[uid]['all']['total'] += count
        if diff_key: clears_map[uid][diff_key]['total'] += count

users = c.execute('''
    SELECT 
        user_id, name, password, join_date, user_code, rating_ptt, 
        character_id, ticket, email, ban_flag,
        song_id, difficulty, score, clear_type, time_played
    FROM user
    ORDER BY rating_ptt DESC, user_id ASC
''').fetchall()

res = []
for u in users:
    d = dict(u)
    uid = d['user_id']
    d['play_count'] = counts.get(uid, 0)
    d['clears'] = clears_map.get(uid, {
        'all': {'clear': 0, 'fr': 0, 'pm': 0, 'total': 0},
        'pst': {'clear': 0, 'fr': 0, 'pm': 0, 'total': 0},
        'prs': {'clear': 0, 'fr': 0, 'pm': 0, 'total': 0},
        'ftr': {'clear': 0, 'fr': 0, 'pm': 0, 'total': 0},
        'byd': {'clear': 0, 'fr': 0, 'pm': 0, 'total': 0},
        'etr': {'clear': 0, 'fr': 0, 'pm': 0, 'total': 0},
    })
    res.append(d)
print(json.dumps(res))
`;
    const res = await queryVpsPython<any[]>(pyScript);
    if (res) {
        setVpsCache(cacheKey, res, 8000);
    }
    return res;
}

/**
 * Fetch players dropdown & scores for a selected player from VPS.
 */
export async function fetchPlayerScoresFromVps(userId?: number | null, diffFilter?: number | null): Promise<{
    players: any[];
    selectedPlayerId: number | null;
    scores: any[];
    potentialHistory?: Array<{ time: number; ratingPtt: number }>;
} | null> {
    const cacheKey = `player_scores:${userId ?? 'default'}:${diffFilter ?? 'all'}`;
    const cached = getVpsCache<any>(cacheKey);
    if (cached) return cached;

    const pyScript = `
payload = json.loads(base64.b64decode(sys.argv[1]).decode('utf-8'))
req_uid = payload.get('userId')
diff = payload.get('diffFilter')
conn = sqlite3.connect('${VPS_DB_PATH}')
conn.row_factory = sqlite3.Row
c = conn.cursor()

user_rows = c.execute('''
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
''').fetchall()
players = [dict(u) for u in user_rows]

active_uid = req_uid
if not active_uid and players:
    with_scores = next((p for p in players if p['total_scores'] > 0), None)
    active_uid = with_scores['user_id'] if with_scores else players[0]['user_id']

scores = []
if active_uid:
    sql = '''
        SELECT 
            song_id, difficulty, score, shiny_perfect_count, perfect_count, near_count, miss_count, clear_type, time_played
        FROM best_score
        WHERE user_id = ?
    '''
    params = [active_uid]
    if diff is not None:
        sql += ' AND difficulty = ?'
        params.append(diff)
    sql += ' ORDER BY score DESC'
    score_rows = c.execute(sql, params).fetchall()
    scores = [dict(s) for s in score_rows]

potential_history = []
log_db_path = '/home/sefeo-english/celest-server/database/arcaea_log.db'
if active_uid and os.path.exists(log_db_path):
    try:
        log_conn = sqlite3.connect(log_db_path)
        log_rows = log_conn.execute('''
            SELECT time, rating_ptt 
            FROM user_rating 
            WHERE user_id = ? 
            ORDER BY time ASC
        ''', (active_uid,)).fetchall()
        potential_history = [{'time': int(r[0]), 'ratingPtt': round(float(r[1]), 3)} for r in log_rows]
    except Exception:
        pass

print(json.dumps({'players': players, 'selectedPlayerId': active_uid, 'scores': scores, 'potentialHistory': potential_history}))
`;
    const res = await queryVpsPython<{ players: any[]; selectedPlayerId: number | null; scores: any[]; potentialHistory?: Array<{ time: number; ratingPtt: number }> }>(pyScript, { userId, diffFilter });
    if (res) {
        setVpsCache(cacheKey, res, 8000);
    }
    return res;
}

/**
 * Fetch all best scores from VPS for Admin Scores feed.
 */
export async function fetchRecentScoresFromVps(): Promise<any[] | null> {
    const cacheKey = 'admin:recent_scores';
    const cached = getVpsCache<any[]>(cacheKey);
    if (cached) return cached;

    const pyScript = `
conn = sqlite3.connect('${VPS_DB_PATH}')
conn.row_factory = sqlite3.Row
rows = conn.execute('''
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
''').fetchall()
print(json.dumps([dict(r) for r in rows]))
`;
    const res = await queryVpsPython<any[]>(pyScript);
    if (res) {
        setVpsCache(cacheKey, res, 8000);
    }
    return res;
}

/**
 * Fetch leaderboard players & scores from VPS.
 */
export async function fetchLeaderboardFromVps(diffFilter?: number | null): Promise<{ users: any[]; scores: any[] } | null> {
    const cacheKey = `admin:leaderboard:${diffFilter ?? 'all'}`;
    const cached = getVpsCache<any>(cacheKey);
    if (cached) return cached;

    const pyScript = `
payload = json.loads(base64.b64decode(sys.argv[1]).decode('utf-8'))
diff = payload.get('diffFilter')
conn = sqlite3.connect('${VPS_DB_PATH}')
conn.row_factory = sqlite3.Row
c = conn.cursor()

users = [dict(u) for u in c.execute('SELECT user_id, name, user_code, rating_ptt, character_id FROM user ORDER BY rating_ptt DESC').fetchall()]

sql = 'SELECT user_id, song_id, difficulty, score, clear_type, time_played FROM best_score'
params = []
if diff is not None:
    sql += ' WHERE difficulty = ?'
    params.append(diff)
sql += ' ORDER BY score DESC'

scores = [dict(s) for s in c.execute(sql, params).fetchall()]
print(json.dumps({'users': users, 'scores': scores}))
`;
    const res = await queryVpsPython<{ users: any[]; scores: any[] }>(pyScript, { diffFilter });
    if (res) {
        setVpsCache(cacheKey, res, 8000);
    }
    return res;
}

/**
 * Fetch player activity log (logins and recent plays) from VPS.
 */
export async function fetchPlayerActivityFromVps(userId: number): Promise<{
    user: any;
    logins: any[];
    recentPlays: any[];
} | null> {
    const pyScript = `
payload = json.loads(base64.b64decode(sys.argv[1]).decode('utf-8'))
uid = payload['userId']
conn = sqlite3.connect('${VPS_DB_PATH}')
conn.row_factory = sqlite3.Row
c = conn.cursor()

user = c.execute('SELECT user_id, name, user_code, email, rating_ptt, character_id, ticket, join_date, ban_flag, password FROM user WHERE user_id = ? LIMIT 1', (uid,)).fetchone()
logins = [dict(r) for r in c.execute('SELECT access_token, login_time, login_ip, login_device FROM login WHERE user_id = ? ORDER BY login_time DESC LIMIT 50', (uid,)).fetchall()]
plays = [dict(r) for r in c.execute('SELECT song_id, difficulty, score, shiny_perfect_count, perfect_count, near_count, miss_count, health, clear_type, rating, time_played FROM recent30 WHERE user_id = ? ORDER BY time_played DESC LIMIT 30', (uid,)).fetchall()]

print(json.dumps({
    'user': dict(user) if user else None,
    'logins': logins,
    'recentPlays': plays
}))
`;
    return queryVpsPython(pyScript, { userId });
}

/**
 * Fetch characters and player character assignment counts from VPS.
 */
export async function fetchCharactersFromVps(): Promise<{
    characters: any[];
    userCounts: Record<number, number>;
} | null> {
    const pyScript = `
conn = sqlite3.connect('${VPS_DB_PATH}')
conn.row_factory = sqlite3.Row
c = conn.cursor()

counts = {}
for r in c.execute('SELECT character_id, COUNT(*) as c FROM user GROUP BY character_id').fetchall():
    counts[r['character_id']] = r['c']

rows = [dict(r) for r in c.execute('''
    SELECT character_id, name, max_level, 
           frag1, prog1, overdrive1, 
           frag20, prog20, overdrive20, 
           frag30, prog30, overdrive30, 
           skill_id, skill_unlock_level, skill_requires_uncap, skill_id_uncap, 
           char_type, is_uncapped 
    FROM character 
    ORDER BY character_id ASC
''').fetchall()]

print(json.dumps({'characters': rows, 'userCounts': counts}))
`;
    return queryVpsPython(pyScript);
}

/**
 * Sync character stats and uncap state updates to VPS.
 */
export async function syncCharacterUpdateToVps(data: {
    characterId: number;
    maxLevel: number;
    isUncapped: boolean;
    frag1: number;
    prog1: number;
    overdrive1: number;
    frag20: number;
    prog20: number;
    overdrive20: number;
    frag30: number;
    prog30: number;
    overdrive30: number;
}): Promise<boolean> {
    const pyScript = `
payload = json.loads(base64.b64decode(sys.argv[1]).decode('utf-8'))
conn = sqlite3.connect('${VPS_DB_PATH}')
c = conn.cursor()
c.execute('''
    UPDATE character 
    SET max_level = ?,
        is_uncapped = ?,
        frag1 = ?, prog1 = ?, overdrive1 = ?,
        frag20 = ?, prog20 = ?, overdrive20 = ?,
        frag30 = ?, prog30 = ?, overdrive30 = ?
    WHERE character_id = ?
''', (
    payload['maxLevel'],
    1 if payload['isUncapped'] else 0,
    payload['frag1'], payload['prog1'], payload['overdrive1'],
    payload['frag20'], payload['prog20'], payload['overdrive20'],
    payload['frag30'], payload['prog30'], payload['overdrive30'],
    payload['characterId']
))
conn.commit()
print(json.dumps({'success': True}))
`;
    const res = await queryVpsPython<{ success: boolean }>(pyScript, data);
    return Boolean(res?.success);
}

/**
 * Search players on VPS live database by name, user code, or user_id.
 */
export async function searchPlayersFromVps(searchQuery: string, limit = 15): Promise<any[] | null> {
    const pyScript = `
payload = json.loads(base64.b64decode(sys.argv[1]).decode('utf-8'))
q = payload.get('q', '').strip()
lim = int(payload.get('limit', 15))

conn = sqlite3.connect('${VPS_DB_PATH}')
conn.row_factory = sqlite3.Row
c = conn.cursor()

if q:
    sql = '''
        SELECT 
            u.user_id, 
            u.name, 
            u.user_code, 
            u.rating_ptt, 
            u.character_id,
            COUNT(b.song_id) as total_scores
        FROM user u
        LEFT JOIN best_score b ON u.user_id = b.user_id
        WHERE u.name LIKE ? OR u.user_code LIKE ? OR CAST(u.user_id AS TEXT) = ?
        GROUP BY u.user_id
        ORDER BY u.rating_ptt DESC
        LIMIT ?
    '''
    pattern = f"%{q}%"
    rows = c.execute(sql, (pattern, pattern, q, lim)).fetchall()
else:
    sql = '''
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
        LIMIT ?
    '''
    rows = c.execute(sql, (lim,)).fetchall()

res = [dict(r) for r in rows]
print(json.dumps(res))
`;
    return await queryVpsPython<any[]>(pyScript, { q: searchQuery, limit });
}






