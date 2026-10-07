import { Lightbox } from '@/components/admin/lightbox';
import { Modal, ModalField, modalInputClass } from '@/components/admin/modal';
import { Panel, PanelHead } from '@/components/admin/ui';
import AdminLayout from '@/layouts/admin-layout';
import { DIFFICULTY_COLOR, type DifficultyCode } from '@/lib/difficulty';
import { jacketGradient } from '@/lib/jacket';
import { cn } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';

type ChartRow = {
    difficulty: DifficultyCode;
    level: string;
    constant: string | null;
    chart_designer: string | null;
    jacket_designer: string | null;
    note_count: number | null;
};

type SongRow = {
    id: number;
    slug: string;
    title: string;
    artist: string | null;
    pack: string | null;
    side: string | null;
    bpm: string | null;
    length: string | null;
    version: string | null;
    released_at: string | null;
    diffs: ChartRow[];
};

type PackOption = { name: string; is_child: boolean };
type PackGroup = { label: string; packs: PackOption[] };

type Props = {
    songs: SongRow[];
    packOptions: PackGroup[];
    initialPackFilter: string | null;
};

type SortBy = 'title' | 'pack' | 'date' | 'bpm' | 'cc';

function maxConstant(song: SongRow): number {
    return Math.max(
        0,
        ...song.diffs.map((d) => (d.constant ? parseFloat(d.constant) : 0)),
    );
}

function formatDate(iso: string | null): string {
    if (!iso) return '—';

    return new Date(iso).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    });
}

function songJacketBackground(slug: string, title: string): string {
    return `url(/storage/jackets/${slug}.jpg), ${jacketGradient(title)}`;
}

export default function AdminSongs({
    songs,
    packOptions,
    initialPackFilter,
}: Props) {
    const params =
        typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search)
            : null;
    const [query, setQuery] = useState(params?.get('q') ?? '');
    const [sortBy, setSortBy] = useState<SortBy>('title');
    const [packFilter, setPackFilter] = useState<string | null>(
        initialPackFilter,
    );
    const [selectedId, setSelectedId] = useState<number | null>(
        songs[0]?.id ?? null,
    );
    const [addSongOpen, setAddSongOpen] = useState(false);
    const [lightboxBg, setLightboxBg] = useState<string | null>(null);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        const rows = songs.filter(
            (s) =>
                (!packFilter || s.pack === packFilter) &&
                (!q ||
                    s.title.toLowerCase().includes(q) ||
                    (s.pack ?? '').toLowerCase().includes(q) ||
                    (s.artist ?? '').toLowerCase().includes(q)),
        );

        const sorters: Record<SortBy, (a: SongRow, b: SongRow) => number> = {
            title: (a, b) => a.title.localeCompare(b.title),
            pack: (a, b) =>
                (a.pack ?? '').localeCompare(b.pack ?? '') ||
                a.title.localeCompare(b.title),
            date: (a, b) =>
                (b.released_at ?? '').localeCompare(a.released_at ?? ''),
            bpm: (a, b) =>
                (parseFloat(b.bpm ?? '0') || 0) -
                (parseFloat(a.bpm ?? '0') || 0),
            cc: (a, b) => maxConstant(b) - maxConstant(a),
        };

        return [...rows].sort(sorters[sortBy]);
    }, [songs, query, packFilter, sortBy]);

    const selected = songs.find((s) => s.id === selectedId) ?? null;

    return (
        <AdminLayout title="Songs & charts">
            <Head title="Admin · Songs & charts" />

            <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(400px,1fr)] items-start gap-4">
                <Panel>
                    <PanelHead
                        title="Songs & charts"
                        count={`${filtered.length} / ${songs.length} songs`}
                        actions={
                            <>
                                <select
                                    value={sortBy}
                                    onChange={(e) =>
                                        setSortBy(e.target.value as SortBy)
                                    }
                                    className="rounded-lg bg-card-alt px-2.5 py-1.5 text-xs font-semibold text-text"
                                >
                                    <option value="title">Title (A–Z)</option>
                                    <option value="pack">Pack</option>
                                    <option value="date">Newest</option>
                                    <option value="bpm">BPM</option>
                                    <option value="cc">Highest constant</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setAddSongOpen(true)}
                                    className="rounded-[11px] bg-lav px-3.5 py-2 text-[12.5px] font-semibold text-text hover:bg-[#4a4780]"
                                >
                                    + Add song
                                </button>
                            </>
                        }
                    />
                    <div className="flex flex-wrap items-center gap-1.5 px-4 pb-3">
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search title, artist, pack…"
                            className="min-w-[200px] flex-1 rounded-lg bg-card-alt px-3 py-1.5 text-[12.5px] text-text placeholder:text-dim focus:outline-none"
                        />
                        {packFilter && (
                            <span className="flex items-center gap-1.5 rounded-[9px] bg-violet px-3 py-1.5 text-[11.5px] font-bold text-prs">
                                Pack: {packFilter}
                                <button
                                    type="button"
                                    aria-label="Clear pack filter"
                                    onClick={() => setPackFilter(null)}
                                    className="font-bold"
                                >
                                    ✕
                                </button>
                            </span>
                        )}
                    </div>
                    <div className="flex h-[calc(100vh-150px)] flex-col overflow-y-auto">
                        {filtered.length === 0 && (
                            <div className="p-9 text-center text-muted">
                                <b className="mb-1 block text-text">
                                    No songs match
                                </b>
                                Change the filter, pack, or search text.
                            </div>
                        )}
                        {filtered.map((song) => (
                            <button
                                key={song.id}
                                type="button"
                                aria-current={song.id === selectedId}
                                onClick={() => setSelectedId(song.id)}
                                className={cn(
                                    'flex w-full items-center gap-3 border-t border-bg px-4 py-2.5 text-left first:border-t-0 hover:bg-card-alt',
                                    song.id === selectedId && 'bg-violet',
                                )}
                            >
                                <div
                                    className="size-[38px] flex-none rounded-[10px] bg-cover bg-center"
                                    style={{
                                        background: songJacketBackground(
                                            song.slug,
                                            song.title,
                                        ),
                                    }}
                                />
                                <div className="min-w-0 flex-1">
                                    <b className="block overflow-hidden text-[14.5px] font-bold text-ellipsis whitespace-nowrap">
                                        {song.title}
                                    </b>
                                    <span className="block overflow-hidden text-[12px] text-ellipsis whitespace-nowrap text-muted">
                                        {song.artist ?? 'Unknown artist'}
                                    </span>
                                </div>
                                <div className="flex flex-none gap-1.5">
                                    {song.diffs.map((d, i) => (
                                        <b
                                            key={d.difficulty}
                                            title={d.constant ?? '—'}
                                            className={cn(
                                                'text-[11.5px] font-bold',
                                                i > 0 &&
                                                    'border-l border-dim/40 pl-1.5',
                                                DIFFICULTY_COLOR[
                                                    d.difficulty
                                                ]?.[0],
                                            )}
                                        >
                                            {d.level}
                                        </b>
                                    ))}
                                </div>
                            </button>
                        ))}
                    </div>
                </Panel>

                <Panel>
                    {!selected ? (
                        <div className="p-10 text-center text-[13px] text-muted">
                            No song selected
                        </div>
                    ) : (
                        <div className="p-[18px]">
                            <button
                                type="button"
                                onClick={() =>
                                    setLightboxBg(
                                        songJacketBackground(
                                            selected.slug,
                                            selected.title,
                                        ),
                                    )
                                }
                                className="mb-3.5 aspect-video w-full cursor-zoom-in rounded-2xl bg-cover bg-center"
                                style={{
                                    background: songJacketBackground(
                                        selected.slug,
                                        selected.title,
                                    ),
                                }}
                            />
                            <div className="mb-3.5 flex flex-col gap-0.5">
                                <span className="text-2xl leading-[1.2] font-bold">
                                    {selected.title}
                                </span>
                                <span className="text-[13.5px] text-muted">
                                    {selected.artist ?? 'Unknown artist'}
                                </span>
                                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
                                    {(
                                        [
                                            ['Pack', selected.pack],
                                            ['Side', selected.side],
                                            ['BPM', selected.bpm],
                                            [
                                                'Length',
                                                selected.length ??
                                                    'not in this source',
                                            ],
                                            [
                                                'Released',
                                                formatDate(
                                                    selected.released_at,
                                                ),
                                            ],
                                            ['Version', selected.version],
                                        ] as const
                                    ).map(([label, value]) => (
                                        <div
                                            key={label}
                                            className="flex flex-col gap-0.5"
                                        >
                                            <span className="text-[10.5px] font-bold tracking-[0.08em] text-muted uppercase">
                                                {label}
                                            </span>
                                            <b className="text-[13px] font-semibold text-text">
                                                {value ?? '—'}
                                            </b>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[560px] border-collapse text-[13.5px]">
                                    <thead>
                                        <tr>
                                            {[
                                                'Diff',
                                                'Level',
                                                'Constant',
                                                'Chart designer',
                                                'Jacket designer',
                                                'Notes',
                                            ].map((h) => (
                                                <th
                                                    key={h}
                                                    className="bg-card-alt px-2.5 py-[7px] text-left text-[10.5px] tracking-[0.06em] text-dim uppercase"
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selected.diffs.map((d) => (
                                            <tr
                                                key={d.difficulty}
                                                className="border-t border-bg"
                                            >
                                                <td
                                                    className={cn(
                                                        'px-2.5 py-2 font-bold',
                                                        DIFFICULTY_COLOR[
                                                            d.difficulty
                                                        ]?.[0],
                                                    )}
                                                >
                                                    {d.difficulty}
                                                </td>
                                                <td className="px-2.5 py-2 tabular-nums">
                                                    {d.level}
                                                </td>
                                                <td className="px-2.5 py-2 tabular-nums">
                                                    {d.constant ?? (
                                                        <span className="text-dim">
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-2.5 py-2">
                                                    {d.chart_designer || (
                                                        <span className="text-dim">
                                                            uncredited
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-2.5 py-2">
                                                    {d.jacket_designer || (
                                                        <span className="text-dim">
                                                            uncredited
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-2.5 py-2 tabular-nums">
                                                    {d.note_count ?? (
                                                        <span className="text-dim">
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </Panel>
            </div>

            {addSongOpen && (
                <AddSongModal
                    packOptions={packOptions}
                    onClose={() => setAddSongOpen(false)}
                    onZoom={setLightboxBg}
                />
            )}

            {lightboxBg && (
                <Lightbox
                    background={lightboxBg}
                    onClose={() => setLightboxBg(null)}
                />
            )}
        </AdminLayout>
    );
}

function AddSongModal({
    packOptions,
    onClose,
    onZoom,
}: {
    packOptions: PackGroup[];
    onClose: () => void;
    onZoom: (bg: string) => void;
}) {
    const [preview, setPreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    return (
        <Modal
            title="Add song"
            subtitle="Field lain (BPM, side, length, difficulty, level, constant, dll.) diisi sesudahnya dari panel detail — di sini cukup yang minimal untuk membuat entrinya dulu."
            onClose={onClose}
            onSave={onClose}
        >
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                <ModalField label="Song name">
                    <input
                        className={modalInputClass}
                        placeholder="Song title"
                        autoFocus
                    />
                </ModalField>
                <ModalField label="Artist">
                    <input
                        className={modalInputClass}
                        placeholder="Artist (kosongkan kalau tidak dikreditkan)"
                    />
                </ModalField>
                <ModalField label="Pack">
                    <select className={modalInputClass} defaultValue="Arcaea">
                        {packOptions.map((group) => (
                            <optgroup key={group.label} label={group.label}>
                                {group.packs.map((p) => (
                                    <option key={p.name} value={p.name}>
                                        {p.is_child ? `— ${p.name}` : p.name}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </ModalField>
            </div>

            <div className="mt-3.5 border-t-0 pt-0">
                <span className="text-[10.5px] font-bold tracking-[0.1em] text-muted uppercase">
                    Jacket art
                </span>
                <div className="mt-1.5 flex items-center gap-3.5">
                    <button
                        type="button"
                        disabled={!preview}
                        onClick={() =>
                            preview && onZoom(`url(${preview}) center/cover`)
                        }
                        className="size-[120px] flex-none rounded-2xl bg-bg bg-cover bg-center disabled:cursor-default"
                        style={
                            preview
                                ? { backgroundImage: `url(${preview})` }
                                : undefined
                        }
                    />
                    <div className="flex flex-col items-start gap-2">
                        <label className="cursor-pointer rounded-[11px] border border-dashed border-lav px-3.5 py-2 text-[12.5px] font-semibold text-muted hover:border-text hover:text-text">
                            ↑ Upload image
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setFileName(file.name);
                                    setPreview(URL.createObjectURL(file));
                                }}
                            />
                        </label>
                        <span className="text-[11.5px] text-dim">
                            {fileName ??
                                'No file — click preview to zoom once uploaded'}
                        </span>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
