import { defineEventHandler, getRouterParam, getQuery, createError, setHeader } from 'h3';
import { spawn } from 'child_process';
import { getSongPackageLocation } from '../../../utils/server-paths.ts';

export default defineEventHandler((event) => {
    const rawSlug = getRouterParam(event, 'slug') || '';
    const slug = rawSlug.trim();
    if (!slug) {
        throw createError({ statusCode: 400, statusMessage: 'Song ID is required' });
    }

    const query = getQuery(event);
    const preferredSource =
        query.source === 'official' || query.source === 'unofficial'
            ? query.source
            : undefined;

    const pkg = getSongPackageLocation(slug, preferredSource);
    if (!pkg) {
        throw createError({
            statusCode: 404,
            statusMessage: `No server chart package found for '${slug}'.`,
        });
    }

    setHeader(event, 'Content-Type', 'application/zip');
    setHeader(event, 'Content-Disposition', `attachment; filename="${slug}.zip"`);
    setHeader(event, 'Cache-Control', 'public, max-age=3600');

    // Spawn zip process to stream directory contents directly to the response
    const zipProc = spawn('zip', ['-q', '-r', '-', '.'], { cwd: pkg.dir });

    return zipProc.stdout;
});

