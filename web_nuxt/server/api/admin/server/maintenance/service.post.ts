import { defineEventHandler, readBody, createError } from 'h3';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

interface ServiceActionBody {
    action: 'start' | 'stop' | 'restart';
}

export default defineEventHandler(async (event) => {
    const body = await readBody<ServiceActionBody>(event);
    if (!body || !['start', 'stop', 'restart'].includes(body.action)) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid action: must be start, stop, or restart' });
    }

    try {
        let output = '';
        if (body.action === 'stop' || body.action === 'restart') {
            const { stdout } = await execFileAsync('/home/luhung/.local/bin/celest-server-stop');
            output += stdout + '\n';
        }

        if (body.action === 'start' || body.action === 'restart') {
            const { stdout } = await execFileAsync('/home/luhung/.local/bin/celest-server-start');
            output += stdout + '\n';
        }

        return {
            success: true,
            action: body.action,
            output: output.trim(),
            message: `Service action "${body.action}" executed successfully.`,
        };
    } catch (err: any) {
        throw createError({ statusCode: 500, statusMessage: err.message || `Failed to ${body.action} service` });
    }
});

