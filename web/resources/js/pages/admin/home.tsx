import { Notice, Panel, PanelHead } from '@/components/admin/ui';
import { homeFeedDotColor, LOG } from '@/data/admin-examples';
import AdminLayout from '@/layouts/admin-layout';
import { DIFFICULTY_COLOR, type DifficultyCode } from '@/lib/difficulty';
import { artworkBackground } from '@/lib/jacket';
import { cn } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';

const RANK_GRADIENT: Record<number, string> = {
    0: 'bg-[linear-gradient(145deg,#FFE9A8,#C9962B)] text-[#2B1D03]',
    1: 'bg-[linear-gradient(145deg,#E7E9F2,#9A9FB5)] text-[#20222E]',
    2: 'bg-[linear-gradient(145deg,#E8B78C,#9C5A2E)] text-[#2B1403]',
};

function formatDate(iso: string | null): string {
    if (!iso) return '—';

    return new Date(iso).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    });
}

type RecentSong = {
    slug: string;
    title: string;
    jacket: string | null;
    pack: string | null;
    released_at: string | null;
    top_difficulty: string | null;
    top_level: string | null;
};

type Props = {
    stats: {
        totalCharts: number;
        totalSongs: number;
        totalPacks: number;
        diffBreakdown: { difficulty: string; count: number }[];
    };
    recent: RecentSong[];
};

export default function AdminHome({ stats, recent }: Props) {
    const maxCount = Math.max(...stats.diffBreakdown.map((d) => d.count), 1);

    return (
        <AdminLayout title="Home">
            <Head title="Admin · Home" />

            <Notice tone="ok">
                <b>Packs & Songs sekarang data asli.</b> {stats.totalSongs} lagu
                / {stats.totalPacks} pack diimpor dari{' '}
                <code className="rounded bg-bg/60 px-1 font-mono text-[11.5px]">
                    data/*.json
                </code>{' '}
                (Task 1.2/1.3). Users, Activity log, dan angka "Needs review" di
                bawah masih contoh — menunggu Fase 4/5.
            </Notice>

            <section className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-[1.1fr_1fr]">
                <div className="flex flex-col gap-[18px] rounded-[20px] bg-card px-6 py-[26px]">
                    <div>
                        <span className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
                            Charts catalogued
                        </span>
                        <div className="mt-1.5 font-brand text-[52px] leading-none font-bold tracking-[-0.01em] tabular-nums">
                            {stats.totalCharts.toLocaleString()}
                        </div>
                        <div className="mt-1.5 text-[12.5px] text-muted">
                            across {stats.totalSongs} songs · {stats.totalPacks}{' '}
                            packs
                        </div>
                    </div>
                    <div className="mt-1 flex flex-col gap-[9px]">
                        {stats.diffBreakdown.map(({ difficulty, count }) => (
                            <div
                                key={difficulty}
                                className="flex items-center gap-2.5 text-[13px]"
                            >
                                <b
                                    className={cn(
                                        'w-9 flex-none tracking-[0.04em]',
                                        DIFFICULTY_COLOR[
                                            difficulty as DifficultyCode
                                        ]?.[0],
                                    )}
                                >
                                    {difficulty}
                                </b>
                                <div className="h-1.5 flex-1 overflow-hidden rounded bg-bg">
                                    <div
                                        className={cn(
                                            'h-full rounded',
                                            DIFFICULTY_COLOR[
                                                difficulty as DifficultyCode
                                            ]?.[1],
                                        )}
                                        style={{
                                            width: `${(count / maxCount) * 100}%`,
                                        }}
                                    />
                                </div>
                                <span className="w-[52px] flex-none text-right text-muted tabular-nums">
                                    {count.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <Panel>
                    <PanelHead
                        title="Recently added"
                        count="up to 20, by in-game date"
                    />
                    <div className="flex max-h-[420px] flex-col overflow-y-auto px-5 pb-4">
                        {recent.map((song, i) => (
                            <Link
                                key={song.slug}
                                href={`/admin/songs?q=${encodeURIComponent(song.title)}`}
                                className="flex items-center gap-[13px] border-t border-dashed border-bg py-[11px] first:border-t-0 [&:hover_b]:underline"
                            >
                                <div
                                    className={cn(
                                        'grid size-[30px] flex-none place-items-center rounded-lg bg-card-alt text-xs font-bold text-muted',
                                        i < 3 && 'rotate-45',
                                        i < 3 && RANK_GRADIENT[i],
                                    )}
                                >
                                    <span className={cn(i < 3 && '-rotate-45')}>
                                        {i + 1}
                                    </span>
                                </div>
                                <div
                                    className="size-[42px] flex-none rounded-[10px]"
                                    style={{
                                        background: artworkBackground(
                                            song.jacket,
                                            song.title,
                                        ),
                                    }}
                                />
                                <div className="min-w-0 flex-1">
                                    <b className="block overflow-hidden text-[13.5px] font-bold text-ellipsis whitespace-nowrap">
                                        {song.title}
                                    </b>
                                    <span className="block text-[11px] text-muted">
                                        {song.pack ?? 'No pack'} ·{' '}
                                        {formatDate(song.released_at)}
                                    </span>
                                </div>
                                {song.top_difficulty && (
                                    <div className="flex-none text-right">
                                        <b
                                            className={cn(
                                                'block text-[17px] font-bold',
                                                DIFFICULTY_COLOR[
                                                    song.top_difficulty as DifficultyCode
                                                ]?.[0],
                                            )}
                                        >
                                            {song.top_difficulty}
                                        </b>
                                        <span className="block text-[10px] tracking-[0.04em] text-dim">
                                            Lv {song.top_level}
                                        </span>
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                </Panel>
            </section>

            <Panel>
                <PanelHead
                    title="Recent activity"
                    actions={
                        <Link
                            href="/admin/log"
                            className="rounded-[11px] border border-dashed border-lav px-[11px] py-[5px] text-[11px] font-semibold text-muted hover:border-text hover:text-text"
                        >
                            View all
                        </Link>
                    }
                />
                <div className="flex flex-col">
                    {LOG.slice(0, 4).map(
                        ([type, who, desc, when, state], i) => (
                            <div
                                key={i}
                                className="flex gap-[11px] border-t border-bg px-4 py-[11px] first:border-t-0"
                            >
                                <div
                                    className={cn(
                                        'mt-1.5 size-2 flex-none rounded-full',
                                        homeFeedDotColor(type, state),
                                    )}
                                />
                                <div className="min-w-0 flex-1">
                                    <b className="font-bold">
                                        {who !== '—' ? `${who} ` : ''}
                                    </b>
                                    {desc}
                                    <span className="mt-0.5 block text-[11px] text-dim">
                                        {when}
                                    </span>
                                </div>
                            </div>
                        ),
                    )}
                </div>
            </Panel>
        </AdminLayout>
    );
}
