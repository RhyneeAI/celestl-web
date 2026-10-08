import { SongGrid, type SongCard } from '@/components/public/song-grid';
import AppLayout from '@/layouts/app-layout';
import { useTranslations } from '@/lib/i18n';
import { artworkBackground } from '@/lib/jacket';
import { Head } from '@inertiajs/react';

type Pack = {
    slug: string;
    name: string;
    section: string | null;
    image: string | null;
    aspect: string | null;
};

export default function PackShow({ pack, songs }: { pack: Pack; songs: SongCard[] }) {
    const t = useTranslations();

    return (
        <AppLayout back={{ href: '/packs', label: t('packs.title') }}>
            <Head title={pack.name} />

            {/*
             * Figma's Pack List frame (39:93) heads the page with a diamond; the pack's own art
             * replaces it where this install has it, since the art says more than the glyph does.
             */}
            <div className="flex items-center gap-3 px-1 pb-4">
                {pack.image ? (
                    <span
                        className="h-14 shrink-0 rounded-xl"
                        style={{
                            aspectRatio: pack.aspect ?? '1/1',
                            background: artworkBackground(pack.image, pack.name),
                        }}
                    />
                ) : (
                    <span className="size-3 rotate-45 rounded-[2px] bg-badge" />
                )}
                <div>
                    <h1 className="text-[19px] font-semibold leading-tight">{pack.name}</h1>
                    <p className="text-[11.5px] text-dim">
                        {pack.section ? `${pack.section} · ` : ''}
                        {songs.length === 1
                            ? t('packs.song_count_one')
                            : t('packs.song_count', { count: songs.length })}
                    </p>
                </div>
            </div>

            <SongGrid songs={songs} />
        </AppLayout>
    );
}
