import AppLayout from '@/layouts/app-layout';
import { formatScore } from '@/lib/arcaea-rating';
import { DIFFICULTY_COLOR, type DifficultyCode } from '@/lib/difficulty';
import { useTranslations } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Head, Link, router } from '@inertiajs/react';

type Identity = { nickname: string; player_id: string } | null;

type BestPlay = {
    slug: string;
    title: string;
    difficulty: string;
    score: number;
    rating: number;
} | null;

type Stats = {
    plays: number;
    charts: number;
    top_average: number | null;
    top_counted: number;
    best: BestPlay;
};

export default function Profile({
    identity,
    member_since,
    stats,
}: {
    identity: Identity;
    member_since: string | null;
    stats: Stats;
}) {
    const t = useTranslations();

    return (
        <AppLayout>
            <Head title={t('account.profile')} />

            <div className="mx-auto w-full max-w-[520px] pt-2">
                <h1 className="px-1 pb-4 text-[20px] font-semibold">{t('account.profile')}</h1>

                <section className="rounded-3xl bg-card p-5">
                    <div className="flex items-center gap-3.5">
                        <span className="grid size-14 flex-none place-items-center rounded-full bg-badge text-[20px] font-bold">
                            {identity?.nickname.slice(0, 1).toUpperCase() ?? '?'}
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-[17px] font-semibold">
                                {identity?.nickname ?? '—'}
                            </p>
                            <p className="font-mono text-[12.5px] tracking-wide text-muted">
                                {identity?.player_id ?? '—'}
                            </p>
                        </div>
                    </div>

                    {member_since && (
                        <p className="mt-4 px-1 text-[12px] text-dim">
                            {t('account.member_since')} : {member_since}
                        </p>
                    )}
                </section>

                {stats.plays === 0 ? (
                    <section className="mt-4 rounded-3xl bg-card px-6 py-10 text-center">
                        <p className="text-[13px] text-dim">{t('account.no_plays')}</p>
                        <Link
                            href="/calculator"
                            className="mt-3 inline-block rounded-xl bg-lav px-5 py-2.5 text-[13px] font-bold"
                        >
                            {t('nav.calculator')}
                        </Link>
                    </section>
                ) : (
                    <>
                        {/* One big number, the way ArcaeaNap leads its summary (CLAUDE.md § Referensi UI). */}
                        <section className="mt-4 rounded-3xl bg-card p-6 text-center">
                            <p className="text-[11px] font-bold tracking-[0.14em] text-dim uppercase">
                                {t('account.top_average', { count: stats.top_counted })}
                            </p>
                            <p className="mt-1 font-mono text-[40px] leading-none font-bold tabular-nums">
                                {stats.top_average?.toFixed(4) ?? '—'}
                            </p>

                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <Stat label={t('account.plays_logged')} value={stats.plays} />
                                <Stat label={t('account.charts_played')} value={stats.charts} />
                            </div>
                        </section>

                        {stats.best && (
                            <section className="mt-4 rounded-3xl bg-card p-4">
                                <h2 className="px-1 text-[11px] font-bold tracking-[0.14em] text-dim uppercase">
                                    {t('account.best_play')}
                                </h2>
                                <Link
                                    href={`/songs/${stats.best.slug}`}
                                    className="mt-2 flex items-center gap-2 rounded-xl bg-card-alt px-3 py-2.5 hover:bg-violet"
                                >
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-[13.5px] font-semibold">
                                            {stats.best.title}
                                        </span>
                                        <span className="block truncate font-mono text-[11.5px] text-dim">
                                            <span
                                                className={
                                                    DIFFICULTY_COLOR[
                                                        stats.best.difficulty as DifficultyCode
                                                    ]?.[0]
                                                }
                                            >
                                                {stats.best.difficulty}
                                            </span>{' '}
                                            {formatScore(stats.best.score)}
                                        </span>
                                    </span>
                                    <span className="flex-none font-mono text-[16px] font-bold tabular-nums">
                                        {stats.best.rating.toFixed(3)}
                                    </span>
                                </Link>
                            </section>
                        )}

                        {/*
                         * The mockup wrote this explanation and it still holds: say why the number
                         * everyone expects is missing, rather than printing one we cannot justify.
                         */}
                        <section className="mt-4 rounded-3xl bg-violet p-4">
                            <h2 className="text-[11px] font-bold tracking-[0.14em] text-warn uppercase">
                                {t('account.why_no_potential')}
                            </h2>
                            <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
                                {t('account.why_no_potential_body')}
                            </p>
                        </section>
                    </>
                )}

                <p className="mt-4 px-1 text-[11.5px] text-dim">{t('account.from_best_50')}</p>

                <button
                    type="button"
                    onClick={() => router.post('/logout')}
                    className={cn(
                        'mt-4 w-full rounded-xl border-2 border-dashed border-lav py-3',
                        'text-[13px] font-semibold text-muted hover:text-text',
                    )}
                >
                    {t('account.sign_out')}
                </button>
            </div>
        </AppLayout>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-2xl bg-violet px-3 py-3">
            <p className="text-[10.5px] font-bold tracking-wider text-dim uppercase">{label}</p>
            <p className="mt-0.5 font-mono text-[20px] font-bold tabular-nums">{value}</p>
        </div>
    );
}
