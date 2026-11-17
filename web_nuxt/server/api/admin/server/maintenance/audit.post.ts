import { defineEventHandler, createError } from 'h3';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export default defineEventHandler(async () => {
    try {
        const { stdout } = await execFileAsync('/home/luhung/.local/bin/celest-audit', ['--check']);
        return {
            success: true,
            output: stdout.trim(),
            message: 'Chart & asset integrity audit passed successfully.',
        };
    } catch (err: any) {
        return {
            success: false,
            output: err.stdout ? err.stdout.trim() : (err.message || 'Audit failed'),
            error: err.message,
        };
    }
});

