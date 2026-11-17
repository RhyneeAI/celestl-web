import { defineEventHandler, createError } from 'h3';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execFileAsync = promisify(execFile);

export default defineEventHandler(async () => {
    const scriptCandidates = [
        path.resolve(process.cwd(), 'ArcaeaServerFork/tools/sync_song_database.py'),
        path.resolve(process.cwd(), '../ArcaeaServerFork/tools/sync_song_database.py'),
    ];

    let scriptPath: string | null = null;
    for (const c of scriptCandidates) {
        if (fs.existsSync(c)) {
            scriptPath = c;
            break;
        }
    }

    if (!scriptPath) {
        throw createError({ statusCode: 500, statusMessage: 'sync_song_database.py script not found' });
    }

    const pyBin = fs.existsSync('/home/luhung/.venvs/arcaea-server/bin/python')
        ? '/home/luhung/.venvs/arcaea-server/bin/python'
        : 'python3';

    try {
        const { stdout, stderr } = await execFileAsync(pyBin, [scriptPath]);
        return {
            success: true,
            output: stdout.trim() || stderr.trim() || 'Database sync completed successfully.',
            message: 'Chart constants, prices, and unlock rules synchronized into arcaea_database.db',
        };
    } catch (err: any) {
        throw createError({ statusCode: 500, statusMessage: err.message || 'Failed to sync database' });
    }
});

