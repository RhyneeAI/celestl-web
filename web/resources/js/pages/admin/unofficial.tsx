import { Modal, ModalField, modalInputClass } from '@/components/admin/modal';
import { Notice, Panel, PanelHead } from '@/components/admin/ui';
import AdminLayout from '@/layouts/admin-layout';
import { DIFFICULTY_COLOR } from '@/lib/difficulty';
import { cn } from '@/lib/utils';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

// The base private server's own chart table only has 5 slots (no INS yet) -- see CLAUDE.md
// § Unofficial and the migration comment on unofficial_charts.difficulty.
const SLOT_DIFFICULTIES = ['PST', 'PRS', 'FTR', 'BYD', 'ETR'] as const;

type ChartSlotData = {
    id: number;
    difficulty: string;
    constant: string | null;
    aff_original_filename: string | null;
    pushed_at: string | null;
};

type SongRow = {
    id: number;
    slug: string;
    title: string;
    artist: string | null;
    charts: ChartSlotData[];
};

type Props = {
    songs: SongRow[];
};

export default function AdminUnofficial({ songs }: Props) {
    const [addOpen, setAddOpen] = useState(false);

    return (
        <AdminLayout title="Custom charts">
            <Head title="Admin · Unofficial custom charts" />

            <Notice>
                <b>Katalog terpisah total.</b> Lagu di halaman ini chart buatan
                sendiri/komunitas untuk private server ("Unofficial" segment) —
                bukan bagian dari katalog resmi Arcaea di Songs & charts, tidak
                pernah tercampur query/ranking-nya.
            </Notice>

            <Notice tone="warn">
                <b>Belum terhubung ke server.</b> File .aff dan constant di
                bawah baru tersimpan di Celestl. Push ke private server (lewat
                API <code className="font-mono text-[11px]">POST /songs</code>{' '}
                dan penempatan file di disk-nya) masih langkah berikutnya, belum
                jalan dari sini.
            </Notice>

            <Panel>
                <PanelHead
                    title="Custom charts"
                    count={`${songs.length} song${songs.length === 1 ? '' : 's'}`}
                    actions={
                        <button
                            type="button"
                            onClick={() => setAddOpen(true)}
                            className="rounded-[11px] bg-lav px-3.5 py-2 text-[12.5px] font-semibold text-text hover:bg-[#4a4780]"
                        >
                            + Add custom song
                        </button>
                    }
                />

                {songs.length === 0 ? (
                    <div className="p-10 text-center text-[13px] text-muted">
                        Belum ada custom chart. Mulai dari "+ Add custom song".
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 p-4">
                        {songs.map((song) => (
                            <SongCard key={song.id} song={song} />
                        ))}
                    </div>
                )}
            </Panel>

            {addOpen && <AddSongModal onClose={() => setAddOpen(false)} />}
        </AdminLayout>
    );
}

function SongCard({ song }: { song: SongRow }) {
    const chartsByDifficulty = new Map(
        song.charts.map((c) => [c.difficulty, c]),
    );

    return (
        <div className="rounded-2xl bg-card-alt p-4">
            <div className="mb-3 flex items-start gap-3">
                <div className="min-w-0 flex-1">
                    <b className="block text-[14.5px] font-bold">
                        {song.title}
                    </b>
                    <span className="block text-xs text-muted">
                        {song.artist ?? 'Unknown artist'} ·{' '}
                        <span className="font-mono">{song.slug}</span>
                    </span>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        if (
                            confirm(
                                `Hapus "${song.title}" beserta semua chart-nya?`,
                            )
                        ) {
                            router.delete(
                                `/admin/unofficial/songs/${song.id}`,
                                {
                                    preserveScroll: true,
                                },
                            );
                        }
                    }}
                    className="rounded-lg border border-dashed border-lav px-2.5 py-1 text-[11px] font-semibold text-muted hover:border-bad hover:text-bad"
                >
                    Delete
                </button>
            </div>
            <div className="flex flex-col gap-1.5">
                {SLOT_DIFFICULTIES.map((difficulty) => (
                    <ChartSlot
                        key={difficulty}
                        songId={song.id}
                        difficulty={difficulty}
                        existing={chartsByDifficulty.get(difficulty) ?? null}
                    />
                ))}
            </div>
        </div>
    );
}

function ChartSlot({
    songId,
    difficulty,
    existing,
}: {
    songId: number;
    difficulty: string;
    existing: ChartSlotData | null;
}) {
    const { data, setData, post, processing, errors } = useForm<{
        difficulty: string;
        constant: string;
        aff: File | null;
    }>({
        difficulty,
        constant: existing?.constant ?? '',
        aff: null,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(`/admin/unofficial/songs/${songId}/charts`, {
            forceFormData: true,
            preserveScroll: true,
        });
    }

    return (
        <form
            onSubmit={submit}
            className="flex flex-wrap items-center gap-2 rounded-lg bg-bg px-3 py-2"
        >
            <b
                className={cn(
                    'w-9 flex-none text-[11.5px] font-bold',
                    DIFFICULTY_COLOR[
                        difficulty as keyof typeof DIFFICULTY_COLOR
                    ]?.[0],
                )}
            >
                {difficulty}
            </b>
            <input
                type="number"
                step="0.1"
                min="0"
                max="12"
                placeholder="Constant"
                value={data.constant}
                onChange={(e) => setData('constant', e.target.value)}
                className={cn(modalInputClass, 'w-[90px] py-1 text-xs')}
            />
            <label className="cursor-pointer rounded-lg border border-dashed border-lav px-2.5 py-1 text-[11px] font-semibold text-muted hover:border-text hover:text-text">
                {data.aff
                    ? data.aff.name
                    : (existing?.aff_original_filename ?? '↑ .aff file')}
                <input
                    type="file"
                    accept=".aff"
                    className="hidden"
                    onChange={(e) =>
                        setData('aff', e.target.files?.[0] ?? null)
                    }
                />
            </label>
            <button
                type="submit"
                disabled={processing}
                className="rounded-lg bg-lav px-2.5 py-1 text-[11px] font-semibold text-text hover:bg-[#4a4780] disabled:opacity-50"
            >
                Save
            </button>
            {existing?.constant && (
                <span className="text-[10.5px] text-dim">
                    tersimpan: {existing.constant}
                </span>
            )}
            {(errors.constant || errors.aff) && (
                <span className="w-full text-[10.5px] text-bad">
                    {errors.constant ?? errors.aff}
                </span>
            )}
        </form>
    );
}

function AddSongModal({ onClose }: { onClose: () => void }) {
    const { data, setData, post, processing, errors } = useForm({
        slug: '',
        title: '',
        artist: '',
    });

    function submit() {
        post('/admin/unofficial/songs', {
            onSuccess: onClose,
        });
    }

    return (
        <Modal
            title="Add custom song"
            subtitle="Lagu/chart buatan sendiri untuk private server — bukan lagu resmi. ID bebas asal unik, dipakai juga sebagai song_id di private server nanti."
            onClose={onClose}
            onSave={submit}
            saveLabel={processing ? 'Saving…' : 'Save'}
        >
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                <ModalField label="Song ID (slug)">
                    <input
                        className={modalInputClass}
                        placeholder="mis. my-custom-song"
                        value={data.slug}
                        onChange={(e) => setData('slug', e.target.value)}
                        autoFocus
                    />
                    {errors.slug && (
                        <span className="text-[11px] text-bad">
                            {errors.slug}
                        </span>
                    )}
                </ModalField>
                <ModalField label="Title">
                    <input
                        className={modalInputClass}
                        placeholder="Song title"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                    />
                    {errors.title && (
                        <span className="text-[11px] text-bad">
                            {errors.title}
                        </span>
                    )}
                </ModalField>
                <ModalField label="Artist" full>
                    <input
                        className={modalInputClass}
                        placeholder="Artist (opsional)"
                        value={data.artist}
                        onChange={(e) => setData('artist', e.target.value)}
                    />
                </ModalField>
            </div>
        </Modal>
    );
}
