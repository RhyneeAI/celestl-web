import AppLayout from '@/layouts/app-layout';
import { DIFFICULTY_COLOR, type DifficultyCode } from '@/lib/difficulty';
import { useTranslations } from '@/lib/i18n';
import { artworkBackground } from '@/lib/jacket';
import { cn } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';

type Chart = {
    difficulty: DifficultyCode;
    level: string;
    constant: string | null;
    note_count: number | null;
    chart_designer: string | null;
    jacket_designer: string | null;
};

type Song = {
    slug: string;
    title: string;
    artist: string | null;
    jacket: string | null;
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
                        style={{ background: artworkBackground(song.jacket, song.title) }}
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

                <section className="min-w-0 rounded-3xl bg-card p-4">
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
                         *
                         * The designer columns do not fit a phone either. Rather than hide them,
                         * the table scrolls sideways (owner's call): every chart shows the same
                         * fields at every width, a narrow screen just reaches them by scrolling.
                         * The wrapper bleeds past the card padding so the cut-off edge is visible
                         * and the table reads as scrollable instead of clipped.
                         */
                        <div className="-mx-4 mt-3 overflow-x-auto px-4">
                            <table className="w-full min-w-[520px] border-separate border-spacing-y-1 text-[12.5px]">
                                <thead>
                                    <tr className="text-[10.5px] font-bold tracking-wider text-text/70 uppercase">
                                        <th className="rounded-l-xl bg-lav px-3 py-2 text-left">
                                            {t('song.difficulty')}
                                        </th>
                                        <th className="bg-lav px-2 py-2 text-right">{t('song.level')}</th>
                                        <th className="bg-lav px-2 py-2 text-right">{t('song.constant')}</th>
                                        <th className="bg-lav px-2 py-2 text-right">{t('song.notes')}</th>
                                        <th className="bg-lav px-3 py-2 text-left">
                                            {t('song.chart_design')}
                                        </th>
                                        <th className="rounded-r-xl bg-lav px-3 py-2 text-left">
                                            {t('song.jacket_design')}
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
                                            </td>
                                            <td className="bg-violet px-2 py-2.5 text-right font-semibold tabular-nums">
                                                {chart.level}
                                            </td>
                                            <td className="bg-violet px-2 py-2.5 text-right tabular-nums">
                                                {chart.constant ?? '—'}
                                            </td>
                                            <td className="bg-violet px-2 py-2.5 text-right tabular-nums">
                                                {chart.note_count ?? '—'}
                                            </td>
                                            <td className="bg-violet px-3 py-2.5 whitespace-nowrap text-muted">
                                                {chart.chart_designer || t('song.uncredited')}
                                            </td>
                                            {/*
                                              * Not always the same as the chart designer, and not
                                              * always the same across a song's difficulties: 17
                                              * songs credit a different artist for their Beyond
                                              * jacket (songlist.json keeps jacketDesigner per
                                              * difficulty, which is why it lives on charts).
                                              */}
                                            <td className="rounded-r-xl bg-violet px-3 py-2.5 whitespace-nowrap text-muted">
                                                {chart.jacket_designer || t('song.uncredited')}
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
