import AppLayout from '@/layouts/app-layout';
import { useTranslations } from '@/lib/i18n';
import { artworkBackground } from '@/lib/jacket';
import { Head, Link } from '@inertiajs/react';

type PackCard = {
    slug: string;
    name: string;
    song_count: number;
    image: string | null;
    // "width/height" of the artwork's own content; null when this install has no art.
    aspect: string | null;
};
type Section = { label: string; packs: PackCard[] };

export default function Packs({ sections }: { sections: Section[] }) {
    const t = useTranslations();

    return (
        <AppLayout>
            <Head title={t('packs.title')} />

            <h1 className="px-1 pt-1 pb-4 text-[20px] font-semibold">{t('packs.title')}</h1>

            <div className="space-y-7">
                {sections.map((section) => (
                    <section key={section.label}>
                        <h2 className="px-1 pb-2.5 text-[11px] font-bold tracking-[0.14em] text-dim uppercase">
                            {section.label}
                        </h2>

                        <div className="grid grid-cols-2 items-start gap-3 sm:grid-cols-3 lg:grid-cols-4">
                            {section.packs.map((pack) => (
                                <Link
                                    key={pack.slug}
                                    href={`/packs/${pack.slug}`}
                                    className="min-w-0 overflow-hidden rounded-2xl bg-card-alt hover:bg-violet"
                                >
                                    <div
                                        className="w-full"
                                        style={{
                                            // Fixed width, height follows the artwork -- cropping
                                            // every pack into one box loses half of a tall banner.
                                            aspectRatio: pack.aspect ?? '168/150',
                                            background: artworkBackground(pack.image, pack.name),
                                        }}
                                    />
                                    <div className="p-3">
                                        <p className="line-clamp-2 break-words text-[13px] font-semibold leading-snug">
                                            {pack.name}
                                        </p>
                                        <p className="mt-0.5 text-[11.5px] text-dim">
                                            {pack.song_count === 1
                                                ? t('packs.song_count_one')
                                                : t('packs.song_count', { count: pack.song_count })}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </AppLayout>
    );
}
