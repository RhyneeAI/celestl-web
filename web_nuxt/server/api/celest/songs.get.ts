import fs from 'fs';
import { defineEventHandler } from 'h3';
import { getServerSonglistPath } from '../../utils/server-paths.ts';

export interface ServerDifficulty {
    ratingClass: number;
    rating: number;
    ratingPlus?: boolean;
    constant: number;
    chartDesigner: string;
    jacketDesigner: string;
    jacketOverride?: boolean;
}

export interface ServerChartRow {
    difficulty: string;
    level: string;
    constant: string;
    chart_designer: string;
    jacket_designer: string;
    ratingClass: number;
    rating: number;
    ratingPlus: boolean;
    jacketOverride: boolean;
    jacket: string;
}

export interface CelestSongItem {
    id: string;
    slug: string;
    title: string;
    artist: string;
    bpm: string | number;
    set: string;
    pack: string;
    side: string;
    bg: string;
    version: string;
    date: number;
    remoteDl: boolean;
    jacket: string;
    jacket_full: string;
    difficulties: ServerDifficulty[];
    diffs: ServerChartRow[];
}

function getDiffCode(rc: number): string {
    switch (rc) {
        case 0: return 'PST';
        case 1: return 'PRS';
        case 2: return 'FTR';
        case 3: return 'BYD';
        case 4: return 'ETR';
        case 5: return 'INS';
        default: return `RC${rc}`;
    }
}

export default defineEventHandler(async () => {
    const serverSonglistPath = getServerSonglistPath();
    if (!serverSonglistPath || !fs.existsSync(serverSonglistPath)) {
        return {
            total: 0,
            songs: [] as CelestSongItem[],
            message: 'Server songlist not found',
        };
    }

    try {
        const raw = JSON.parse(fs.readFileSync(serverSonglistPath, 'utf-8'));
        const songs: CelestSongItem[] = (raw.songs || []).map((s: any) => {
            const difficulties: ServerDifficulty[] = (s.difficulties || []).map((d: any) => ({
                ratingClass: d.ratingClass,
                rating: d.rating,
                ratingPlus: Boolean(d.ratingPlus),
                constant: d.constant ?? d.rating,
                chartDesigner: d.chartDesigner || '-',
                jacketDesigner: d.jacketDesigner || '',
                jacketOverride: Boolean(d.jacketOverride),
            }));

            const diffs: ServerChartRow[] = difficulties.map((d) => ({
                difficulty: getDiffCode(d.ratingClass),
                level: `${d.rating}${d.ratingPlus ? '+' : ''}`,
                constant: Number(d.constant).toFixed(1),
                chart_designer: d.chartDesigner,
                jacket_designer: d.jacketDesigner,
                ratingClass: d.ratingClass,
                rating: d.rating,
                ratingPlus: Boolean(d.ratingPlus),
                jacketOverride: Boolean(d.jacketOverride),
                jacket: `/api/jacket/${s.id}?diff=${d.ratingClass}`,
            }));

            const sideText =
                s.side === 0 ? 'Light' :
                s.side === 1 ? 'Conflict' :
                s.side === 2 ? 'Colorless' :
                s.side === 3 ? 'Lephon' :
                s.side === 4 ? 'Catastrophe' : 'Other';

            return {
                id: s.id,
                slug: s.id,
                title: s.title_localized?.en || s.id,
                artist: s.artist || 'Unknown artist',
                bpm: s.bpm || '—',
                set: s.set || 'Single',
                pack: s.set || 'Single',
                side: sideText,
                bg: s.bg || s.id,
                version: s.version || '1.0',
                date: s.date || 0,
                remoteDl: Boolean(s.remote_dl),
                jacket: `/api/jacket/${s.id}`,
                jacket_full: `/api/jacket/${s.id}`,
                difficulties,
                diffs,
            };
        });

        return {
            total: songs.length,
            songs,
        };
    } catch (e: any) {
        return {
            total: 0,
            songs: [] as CelestSongItem[],
            error: e.message,
        };
    }
});
