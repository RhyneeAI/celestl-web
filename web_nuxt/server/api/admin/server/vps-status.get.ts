import { defineEventHandler } from 'h3';
import https from 'https';
import fs from 'fs';

const VPS_HOST = '139.190.96.194';
const VPS_PORT = 8765;
const VPS_SSH_KEY = '/home/luhung/.ssh/sefeo-biznet.pem';

interface CachedStatus {
    isLive: boolean;
    latencyMs: number;
    hasSshKey: boolean;
    timestamp: number;
}

let cached: CachedStatus | null = null;
const CACHE_TTL_MS = 20_000; // 20 seconds cache

function pingVps(): Promise<{ isLive: boolean; latencyMs: number }> {
    return new Promise((resolve) => {
        const start = Date.now();
        const req = https.get(
            `https://${VPS_HOST}:${VPS_PORT}`,
            { rejectUnauthorized: false, timeout: 2500 },
            (res) => {
                const latencyMs = Date.now() - start;
                resolve({ isLive: res.statusCode === 200, latencyMs });
            }
        );
        req.on('error', () => resolve({ isLive: false, latencyMs: -1 }));
        req.on('timeout', () => {
            req.destroy();
            resolve({ isLive: false, latencyMs: -1 });
        });
    });
}

export default defineEventHandler(async () => {
    const now = Date.now();
    if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
        return {
            success: true,
            isLive: cached.isLive,
            host: VPS_HOST,
            port: VPS_PORT,
            latencyMs: cached.latencyMs,
            hasSshKey: cached.hasSshKey,
            cached: true,
        };
    }

    const hasSshKey = fs.existsSync(VPS_SSH_KEY);
    const { isLive, latencyMs } = await pingVps();

    cached = {
        isLive,
        latencyMs,
        hasSshKey,
        timestamp: now,
    };

    return {
        success: true,
        isLive,
        host: VPS_HOST,
        port: VPS_PORT,
        latencyMs,
        hasSshKey,
        cached: false,
    };
});
