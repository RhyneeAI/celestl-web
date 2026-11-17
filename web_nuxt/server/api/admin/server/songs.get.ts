import fs from 'fs';
import path from 'path';

export default defineEventHandler(async () => {
    // Read directly from ArcaeaServerFork/database/songs/songlist
    const serverSonglistPath = path.resolve(process.cwd(), '../ArcaeaServerFork/database/songs/songlist');
    
    if (!fs.existsSync(serverSonglistPath)) {
        return {
            songs: [],
            total: 0,
            message: 'Server songlist not found'
        };
    }

    try {
        const raw = JSON.parse(fs.readFileSync(serverSonglistPath, 'utf-8'));
        const songs = (raw.songs || []).map((s: any) => ({
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
            songs: [],
            total: 0,
            error: e.message
        };
    }
});
