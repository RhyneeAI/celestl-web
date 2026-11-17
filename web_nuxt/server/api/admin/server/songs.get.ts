import fs from 'fs';
import { getServerSonglistPath } from '../../../utils/server-paths.ts';

export interface ServerDifficulty {
    ratingClass: number;
    rating: number;
    ratingPlus?: boolean;
    constant: number;
    chartDesigner: string;
    jacketDesigner: string;
}

export interface ServerSongItem {
    id: string;
    title: string;
    artist: string;
    bpm: string | number;
    set: string;
    date: number;
    remoteDl: boolean;
    difficulties: ServerDifficulty[];
}

export default defineEventHandler(async () => {
    // Read directly from ArcaeaServerFork/database/songs/songlist
    const serverSonglistPath = getServerSonglistPath();
    
    if (!serverSonglistPath) {
        return {
            songs: [] as ServerSongItem[],
            total: 0,
            message: 'Server songlist not found'
        };
    }

    try {
        const raw = JSON.parse(fs.readFileSync(serverSonglistPath, 'utf-8'));
        const songs: ServerSongItem[] = (raw.songs || []).map((s: any) => ({
            id: s.id,
            title: s.title_localized?.en || s.id,
            artist: s.artist,
            bpm: s.bpm,
            set: s.set,
            date: s.date,
            remoteDl: s.remote_dl || false,
            difficulties: (s.difficulties || []).map((d: any) => ({
                ratingClass: d.ratingClass,
                rating: d.rating,
                ratingPlus: d.ratingPlus || false,
                constant: d.constant || d.rating,
                chartDesigner: d.chartDesigner || '-',
                jacketDesigner: d.jacketDesigner || '',
            }))
        }));

        return {
            total: songs.length,
            songs
        };
    } catch (e: any) {
        return {
            songs: [] as ServerSongItem[],
            total: 0,
            error: e.message
        };
    }
});
