import { SongGrid, type SongCard } from '@/components/public/song-grid';
import AppLayout from '@/layouts/app-layout';
import { useTranslations } from '@/lib/i18n';
import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';

type SongRow = SongCard & { pack: string | null };

export default function Songs({ songs }: { songs: SongRow[] }) {
    const t = useTranslations();
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return songs;

        return songs.filter(
            (song) =>
                song.title.toLowerCase().includes(q) ||
                (song.artist ?? '').toLowerCase().includes(q) ||
                (song.pack ?? '').toLowerCase().includes(q),
        );
    }, [songs, query]);

    return (
        <AppLayout>
            <Head title={t('songs.title')} />

            <h1 className="sr-only">{t('songs.title')}</h1>

            {/* Pill input from the Figma mobile frame -- color fill, no border. */}
            <div className="sticky top-[57px] z-10 -mx-4 bg-bg px-4 pt-1 pb-3 sm:-mx-6 sm:px-6">
                <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t('songs.search_placeholder')}
                    aria-label={t('songs.search_placeholder')}
                    className="w-full rounded-full bg-card px-5 py-3 text-[14px] text-text placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-pst/60"
                />
                <p className="mt-2 px-1 text-[11.5px] text-dim">
                    {t('songs.count', { shown: filtered.length, total: songs.length })}
                </p>
            </div>

            {filtered.length > 0 ? (
                <SongGrid songs={filtered} />
            ) : (
                <div className="mt-10 rounded-3xl bg-card px-6 py-12 text-center">
                    <p className="text-[15px] font-semibold">{t('songs.empty_title')}</p>
                    <p className="mt-1.5 text-[12.5px] text-dim">{t('songs.empty_body')}</p>
                </div>
            )}
        </AppLayout>
    );
}
