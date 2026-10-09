import AppLayout from '@/layouts/app-layout';
import {
    formatScore,
    grade,
    LAMPS,
    playRating,
    type Lamp,
} from '@/lib/arcaea-rating';
import {
    readHistory,
    writeHistory,
    type HistoryEntry,
} from '@/lib/calculator-history';
import { DIFFICULTY_COLOR, type DifficultyCode } from '@/lib/difficulty';
import { useTranslations } from '@/lib/i18n';
import { artworkBackground } from '@/lib/jacket';
import { cn } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

type ChartOption = {
    difficulty: DifficultyCode;
    level: string;
    constant: number | null;
};

type SongOption = {
    slug: string;
    title: string;
    artist: string | null;
    jacket: string | null;
    charts: ChartOption[];
};

export default function Calculator({ songs }: { songs: SongOption[] }) {
    const t = useTranslations();

    const [query, setQuery] = useState('');
    const [slug, setSlug] = useState<string | null>(null);
    const [difficulty, setDifficulty] = useState<DifficultyCode | null>(null);
    const [score, setScore] = useState(9_900_000);
    const [lamp, setLamp] = useState<Lamp>('normal_clear');
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [justSaved, setJustSaved] = useState(false);

    // Read on mount, not during render: localStorage does not exist while Inertia renders this on
    // the server, and a render that touches it would differ from the markup already sent.
    useEffect(() => setHistory(readHistory()), []);

    const song = useMemo(
        () => songs.find((candidate) => candidate.slug === slug) ?? null,
        [songs, slug],
    );

    const chart = useMemo(
        () => song?.charts.find((option) => option.difficulty === difficulty) ?? null,
        [song, difficulty],
    );

    const matches = useMemo(() => {
        const needle = query.trim().toLowerCase();
        if (!needle) return [];

        return songs
            .filter(
                (candidate) =>
                    candidate.title.toLowerCase().includes(needle) ||
                    (candidate.artist ?? '').toLowerCase().includes(needle),
            )
            .slice(0, 40);
    }, [songs, query]);

    function pick(candidate: SongOption) {
        setSlug(candidate.slug);
        setQuery('');
        // Future is the difficulty people land on most; otherwise the hardest one available.
        const preferred =
            candidate.charts.find((option) => option.difficulty === 'FTR') ??
            candidate.charts[candidate.charts.length - 1];
        setDifficulty(preferred?.difficulty ?? null);
    }

    const rating =
        chart?.constant != null ? playRating(chart.constant, score, lamp) : null;

    function save() {
        if (!song || !chart || chart.constant == null || rating == null) return;

        const entry: HistoryEntry = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            slug: song.slug,
            title: song.title,
            difficulty: chart.difficulty,
            constant: chart.constant,
            score,
            lamp,
            rating,
            playedAt: new Date().toISOString(),
        };

        const next = [entry, ...history].slice(0, 200);
        setHistory(next);
        writeHistory(next);
        setJustSaved(true);
        window.setTimeout(() => setJustSaved(false), 1500);
    }

    function remove(id: string) {
        const next = history.filter((entry) => entry.id !== id);
        setHistory(next);
        writeHistory(next);
    }

    return (
        <AppLayout>
            <Head title={t('calculator.title')} />

            <h1 className="px-1 pt-1 pb-4 text-[20px] font-semibold">
                {t('calculator.title')}
            </h1>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] lg:items-start">
                <div className="min-w-0 space-y-4">
                    <section className="rounded-3xl bg-card p-4">
                        {song ? (
                            <div className="flex items-center gap-3">
                                <span
                                    className="size-14 flex-none rounded-xl"
                                    style={{
                                        background: artworkBackground(
                                            song.jacket,
                                            song.title,
                                        ),
                                    }}
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[15px] font-semibold">
                                        {song.title}
                                    </p>
                                    <p className="truncate text-[12px] text-dim">
                                        {song.artist ?? t('songs.unknown_artist')}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSlug(null)}
                                    className="flex-none rounded-full bg-violet px-3 py-1.5 text-[11.5px] font-bold text-muted hover:text-text"
                                >
                                    {t('calculator.change_song')}
                                </button>
                            </div>
                        ) : (
                            <>
                                <label
                                    htmlFor="song"
                                    className="px-1 text-[11px] font-bold tracking-[0.14em] text-dim uppercase"
                                >
                                    {t('calculator.pick_song')}
                                </label>
                                <input
                                    id="song"
                                    type="search"
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder={t('calculator.search_placeholder')}
                                    autoComplete="off"
                                    className="mt-2 w-full rounded-full bg-violet px-5 py-3 text-[14px] text-text placeholder:text-dim focus:ring-2 focus:ring-pst/60 focus:outline-none"
                                />

                                {matches.length > 0 && (
                                    <ul className="mt-2 max-h-[280px] overflow-y-auto">
                                        {matches.map((candidate) => (
                                            <li key={candidate.slug}>
                                                <button
                                                    type="button"
                                                    onClick={() => pick(candidate)}
                                                    className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left hover:bg-card-alt"
                                                >
                                                    <span
                                                        className="size-9 flex-none rounded-lg"
                                                        style={{
                                                            background: artworkBackground(
                                                                candidate.jacket,
                                                                candidate.title,
                                                            ),
                                                        }}
                                                    />
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block truncate text-[13px] font-semibold">
                                                            {candidate.title}
                                                        </span>
                                                        <span className="block truncate text-[11px] text-dim">
                                                            {candidate.artist ??
                                                                t('songs.unknown_artist')}
                                                        </span>
                                                    </span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        )}
                    </section>

                    {song && (
                        <section className="space-y-4 rounded-3xl bg-card p-4">
                            <div>
                                <span className="px-1 text-[11px] font-bold tracking-[0.14em] text-dim uppercase">
                                    {t('calculator.difficulty')}
                                </span>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {song.charts.map((option) => (
                                        <button
                                            key={option.difficulty}
                                            type="button"
                                            onClick={() => setDifficulty(option.difficulty)}
                                            aria-pressed={option.difficulty === difficulty}
                                            className={cn(
                                                'rounded-full px-3.5 py-2 text-[12px] font-bold',
                                                option.difficulty === difficulty
                                                    ? 'bg-lav'
                                                    : 'bg-violet hover:bg-lav/60',
                                                DIFFICULTY_COLOR[option.difficulty][0],
                                            )}
                                        >
                                            {option.difficulty} {option.level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="score"
                                    className="px-1 text-[11px] font-bold tracking-[0.14em] text-dim uppercase"
                                >
                                    {t('calculator.score')}
                                </label>
                                <input
                                    id="score"
                                    type="number"
                                    min={0}
                                    max={10_010_000}
                                    step={1}
                                    value={score}
                                    onChange={(event) =>
                                        setScore(
                                            Math.min(
                                                10_010_000,
                                                Math.max(0, Number(event.target.value) || 0),
                                            ),
                                        )
                                    }
                                    className="mt-2 w-full rounded-xl bg-violet px-4 py-3 text-center font-mono text-[22px] tabular-nums text-text focus:ring-2 focus:ring-pst/60 focus:outline-none"
                                />
                                <p className="mt-1.5 text-center font-mono text-[13px] text-muted">
                                    {formatScore(score)}
                                </p>
                            </div>

                            <div>
                                <span className="px-1 text-[11px] font-bold tracking-[0.14em] text-dim uppercase">
                                    {t('calculator.lamp')}
                                </span>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {LAMPS.map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => setLamp(option)}
                                            aria-pressed={option === lamp}
                                            className={cn(
                                                'rounded-full px-3.5 py-2 text-[12px] font-bold',
                                                option === lamp
                                                    ? 'bg-lav text-text'
                                                    : 'bg-violet text-muted hover:text-text',
                                            )}
                                        >
                                            {t(`calculator.lamps.${option}`)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/*
                     * The Figma "Drop Image" section, kept visibly inert. Fase 3 builds the reader;
                     * a control that looks live but does nothing would be worse than one that says
                     * plainly it is not ready.
                     */}
                    <section
                        aria-disabled
                        className="rounded-3xl border-2 border-dashed border-lav p-6 text-center"
                    >
                        <p className="text-[15px] font-semibold text-muted">
                            {t('calculator.drop_image')}
                        </p>
                        <p className="mx-auto mt-1.5 max-w-[340px] text-[12px] text-dim">
                            {t('calculator.drop_image_note')}
                        </p>
                    </section>
                </div>

                <div className="min-w-0 space-y-4">
                    <Result
                        chart={chart}
                        score={score}
                        rating={rating}
                        canSave={Boolean(song && chart && chart.constant != null)}
                        justSaved={justSaved}
                        onSave={save}
                    />

                    <History history={history} onRemove={remove} onClear={() => {
                        setHistory([]);
                        writeHistory([]);
                    }} />
                </div>
            </div>
        </AppLayout>
    );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-[96px_minmax(0,1fr)] items-stretch">
            <span className="flex items-center bg-lav px-3 py-2.5 text-[10.5px] font-bold tracking-wider text-text uppercase">
                {label}
            </span>
            <span className="flex items-center justify-center bg-violet px-3 py-2.5 text-center font-mono text-[15px] tabular-nums">
                {children}
            </span>
        </div>
    );
}

function Result({
    chart,
    score,
    rating,
    canSave,
    justSaved,
    onSave,
}: {
    chart: ChartOption | null;
    score: number;
    rating: number | null;
    canSave: boolean;
    justSaved: boolean;
    onSave: () => void;
}) {
    const t = useTranslations();

    if (!chart) {
        return (
            <section className="rounded-3xl bg-card p-6 text-center text-[13px] text-dim">
                {t('calculator.empty')}
            </section>
        );
    }

    return (
        <section className="rounded-3xl bg-card p-4">
            {/* Label/data split from the Figma "Result Detail" component (104:18). */}
            <div className="overflow-hidden rounded-2xl">
                <Row label={t('calculator.score')}>{formatScore(score)}</Row>
                <Row label={t('calculator.grade')}>{grade(score)}</Row>
                <Row label={t('calculator.constant')}>
                    {chart.constant?.toFixed(1) ?? '—'}
                </Row>
                <Row label={t('calculator.potential')}>
                    {/* Three decimals, the way the game prints it on a Top 50 card. */}
                    {rating === null ? '—' : rating.toFixed(3)}
                </Row>
            </div>

            {chart.constant == null && (
                <p className="mt-3 text-[12px] text-warn">{t('calculator.no_constant')}</p>
            )}

            <button
                type="button"
                onClick={onSave}
                disabled={!canSave}
                className="mt-3 w-full rounded-xl bg-lav py-3 text-[13px] font-bold text-text disabled:opacity-50"
            >
                {justSaved ? t('calculator.saved') : t('calculator.save')}
            </button>
        </section>
    );
}

function History({
    history,
    onRemove,
    onClear,
}: {
    history: HistoryEntry[];
    onRemove: (id: string) => void;
    onClear: () => void;
}) {
    const t = useTranslations();

    return (
        <section className="rounded-3xl bg-card p-4">
            <div className="flex items-center gap-2 px-1">
                <h2 className="text-[11px] font-bold tracking-[0.14em] text-dim uppercase">
                    {t('calculator.history')}
                </h2>
                {history.length > 0 && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="ml-auto text-[11.5px] font-semibold text-muted hover:text-text"
                    >
                        {t('calculator.history_clear')}
                    </button>
                )}
            </div>

            {history.length === 0 ? (
                <p className="mt-2 px-1 text-[12.5px] text-dim">
                    {t('calculator.history_empty')}
                </p>
            ) : (
                <ul className="mt-2 space-y-1">
                    {history.map((entry) => (
                        <li
                            key={entry.id}
                            className="flex items-center gap-2 rounded-xl bg-card-alt px-3 py-2"
                        >
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-[12.5px] font-semibold">
                                    {entry.title}
                                </span>
                                <span className="block truncate font-mono text-[11px] text-dim">
                                    <span
                                        className={
                                            DIFFICULTY_COLOR[
                                                entry.difficulty as DifficultyCode
                                            ]?.[0]
                                        }
                                    >
                                        {entry.difficulty}
                                    </span>{' '}
                                    {formatScore(entry.score)}
                                </span>
                            </span>
                            <span className="flex-none font-mono text-[13px] font-bold tabular-nums">
                                {entry.rating.toFixed(3)}
                            </span>
                            <button
                                type="button"
                                onClick={() => onRemove(entry.id)}
                                aria-label={t('calculator.remove')}
                                className="flex-none rounded-lg px-1.5 text-[16px] leading-none text-dim hover:text-text"
                            >
                                ×
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <p className="mt-3 px-1 text-[11px] text-dim">
                {t('calculator.history_local')}
            </p>
        </section>
    );
}
