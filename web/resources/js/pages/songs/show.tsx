import AppLayout from '@/layouts/app-layout';
import { DIFFICULTY_COLOR, type DifficultyCode } from '@/lib/difficulty';
import { useTranslations } from '@/lib/i18n';
import { jacketGradient } from '@/lib/jacket';
import { cn } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';

type Chart = {
    difficulty: DifficultyCode;
    level: string;
    constant: string | null;
    note_count: number | null;
    chart_designer: string | null;
};

type Song = {
    slug: string;
    title: string;
    artist: string | null;
    bpm: string | null;
    length: string | null;
    side: string | null;
    version: string | null;
    released_at: string | null;
    pack: { slug: string; name: string } | null;
    charts: Chart[];
};

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    });
}

export default function SongShow({ song }: { song: Song }) {
    const t = useTranslations();

    const meta: { label: string; value: string | null }[] = [
        { label: t('song.bpm'), value: song.bpm },
        { label: t('song.length'), value: song.length },
        { label: t('song.side'), value: song.side },
        { label: t('song.version'), value: song.version },
        { label: t('song.released'), value: song.released_at ? formatDate(song.released_at) : null },
    ].filter((row) => row.value !== null);

    return (
        <AppLayout back={{ href: '/' }}>
            <Head title={song.title} />

            <div className="grid gap-4 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:items-start">
                <div className="rounded-3xl bg-card p-4">
                    <div
                        className="aspect-square w-full rounded-2xl"
                        style={{
                            background: `url(/storage/jackets/${song.slug}.jpg), ${jacketGradient(song.title)}`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    />
                    <h1 className="mt-4 text-[20px] font-semibold leading-tight">{song.title}</h1>
                    <p className="mt-1 text-[13px] text-muted">
                        {song.artist ?? t('songs.unknown_artist')}
                    </p>

                    <dl className="mt-4 space-y-1.5">
                        {meta.map((row) => (
                            <div key={row.label} className="flex gap-2 text-[12.5px]">
                                <dt className="min-w-[72px] text-dim">{row.label}</dt>
                                <dd className="font-medium">: {row.value}</dd>
                            </div>
                        ))}
                        <div className="flex gap-2 text-[12.5px]">
                            <dt className="min-w-[72px] text-dim">{t('song.pack')}</dt>
                            <dd className="font-medium">
                                :{' '}
                                {song.pack ? (
                                    <Link href={`/packs/${song.pack.slug}`} className="text-pst hover:underline">
                                        {song.pack.name}
                                    </Link>
                                ) : (
                                    t('songs.no_pack')
                                )}
                            </dd>
                        </div>
                    </dl>
                </div>

                <section className="rounded-3xl bg-card p-4">
                    <h2 className="px-1 text-[11px] font-bold tracking-[0.14em] text-dim uppercase">
                        {t('song.charts')}
                    </h2>

                    {song.charts.length === 0 ? (
                        <p className="mt-3 px-1 text-[12.5px] text-dim">{t('song.no_charts')}</p>
                    ) : (
                        /*
                         * Figma draws this as a matrix with difficulties as COLUMNS, but it only
                         * drew three of them -- six (PST..INS) will not fit a phone that way, so
                         * the axes are flipped: difficulties become rows. Label cells keep the
                         * --lav fill and data cells --violet, as in the design.
                         */
                        <div className="mt-3 overflow-hidden rounded-2xl">
                            <table className="w-full border-separate border-spacing-y-1 text-[12.5px]">
                                <thead>
                                    <tr className="text-[10.5px] font-bold tracking-wider text-text/70 uppercase">
                                        <th className="rounded-l-xl bg-lav px-3 py-2 text-left">
                                            {t('song.difficulty')}
                                        </th>
                                        <th className="bg-lav px-2 py-2 text-right">{t('song.level')}</th>
                                        <th className="bg-lav px-2 py-2 text-right">{t('song.constant')}</th>
                                        <th className="rounded-r-xl bg-lav px-3 py-2 text-right sm:rounded-none">
                                            {t('song.notes')}
                                        </th>
                                        <th className="hidden rounded-r-xl bg-lav px-3 py-2 text-left sm:table-cell">
                                            {t('song.chart_design')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {song.charts.map((chart) => (
                                        <tr key={chart.difficulty}>
                                            <td className="rounded-l-xl bg-violet px-3 py-2.5">
                                                <span className="inline-flex items-center gap-2">
                                                    <span
                                                        className={cn(
                                                            'size-2 rounded-full',
                                                            DIFFICULTY_COLOR[chart.difficulty][1],
                                                        )}
                                                    />
                                                    <span
                                                        className={cn(
                                                            'font-bold',
                                                            DIFFICULTY_COLOR[chart.difficulty][0],
                                                        )}
                                                    >
                                                        {chart.difficulty}
                                                    </span>
                                                </span>
                                                {/* Designer has no column on a phone, so it rides along here. */}
                                                <span className="mt-0.5 block text-[11px] text-muted sm:hidden">
                                                    {chart.chart_designer ?? t('song.uncredited')}
                                                </span>
                                            </td>
                                            <td className="bg-violet px-2 py-2.5 text-right font-semibold tabular-nums">
                                                {chart.level}
                                            </td>
                                            <td className="bg-violet px-2 py-2.5 text-right tabular-nums">
                                                {chart.constant ?? '—'}
                                            </td>
                                            <td className="rounded-r-xl bg-violet px-3 py-2.5 text-right tabular-nums sm:rounded-none">
                                                {chart.note_count ?? '—'}
                                            </td>
                                            <td className="hidden rounded-r-xl bg-violet px-3 py-2.5 text-muted sm:table-cell">
                                                {chart.chart_designer ?? t('song.uncredited')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}
