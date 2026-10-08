import { useTranslations } from '@/lib/i18n';
import { jacketGradient } from '@/lib/jacket';
import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export type SongCard = {
    slug: string;
    title: string;
    artist: string | null;
};

/**
 * The 2-column jacket grid from the Figma mobile frames (Search Result 67:41, Pack List 39:93),
 * widened on bigger screens since no desktop design exists to follow (CLAUDE.md § Desain).
 *
 * Jacket art is never shipped in this repo: the real file is an optional local extra on the public
 * disk, and the deterministic gradient underneath is what everyone else sees.
 */
export function SongGrid({ songs, pageSize = 48 }: { songs: SongCard[]; pageSize?: number }) {
    const t = useTranslations();
    const [visible, setVisible] = useState(pageSize);
    const sentinel = useRef<HTMLDivElement | null>(null);

    // The whole catalogue (~563 songs) arrives in one prop so search stays instant, but rendering
    // every card up front is a lot of DOM for a phone — grow the slice as the user scrolls instead.
    useEffect(() => setVisible(pageSize), [songs, pageSize]);

    useEffect(() => {
        const node = sentinel.current;
        if (!node || visible >= songs.length) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setVisible((count) => count + pageSize);
            }
        });
        observer.observe(node);

        return () => observer.disconnect();
    }, [visible, songs.length, pageSize]);

    return (
        <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {songs.slice(0, visible).map((song) => (
                    <Link
                        key={song.slug}
                        href={`/songs/${song.slug}`}
                        // min-w-0: a grid item defaults to min-width:auto, so one unbreakable
                        // title (plenty of Arcaea songs have them) widens the whole column and
                        // pushes the page into horizontal scroll.
                        className="group min-w-0 rounded-2xl p-2 hover:bg-card-alt"
                    >
                        <div
                            className="aspect-square w-full rounded-xl bg-cover bg-center"
                            style={{
                                background: `url(/storage/jackets/${song.slug}.jpg), ${jacketGradient(song.title)}`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        />
                        <p className="mt-2 line-clamp-2 break-words text-[13px] font-semibold leading-snug">
                            {song.title}
                        </p>
                        <p className="line-clamp-1 break-all text-[11.5px] text-dim">
                            {song.artist ?? t('songs.unknown_artist')}
                        </p>
                    </Link>
                ))}
            </div>

            {/* Height, not zero-size: a 0px sentinel can sit permanently outside the root margin. */}
            <div ref={sentinel} className="h-8" />
        </>
    );
}
