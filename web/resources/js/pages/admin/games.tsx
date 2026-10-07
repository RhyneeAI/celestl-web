import { Notice, Panel, PanelHead } from '@/components/admin/ui';
import { GAMES } from '@/data/admin-examples';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';
import { Head } from '@inertiajs/react';

export default function AdminGames() {
    return (
        <AdminLayout title="Game management">
            <Head title="Admin · Game management" />

            <Notice>
                <b>Dirancang universal.</b> Tiap game menyimpan skema identitas
                sendiri (label + format), bukan kolom kode terpisah per game —
                supaya menambah game baru hanya isi data ini, tidak mengubah
                form register. Rotaeno masih di-hold sesuai CLAUDE.md.
            </Notice>

            <Panel>
                <PanelHead title="Games" />
                <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3.5 p-4">
                    {GAMES.map((game) => (
                        <div
                            key={game.name}
                            className={cn(
                                'flex flex-col gap-2.5 rounded-2xl bg-card-alt p-4',
                                game.status === 'hold' && 'opacity-55',
                            )}
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="size-[38px] flex-none rounded-[11px] bg-lav" />
                                <div className="flex-1 text-[15px] font-bold">
                                    {game.name}
                                </div>
                                <span
                                    className={cn(
                                        'rounded-full px-2.5 py-0.5 text-[10px] font-bold',
                                        game.status === 'active'
                                            ? 'bg-ok/12 text-ok'
                                            : 'bg-violet text-muted',
                                    )}
                                >
                                    {game.status === 'active'
                                        ? 'Active'
                                        : 'On hold'}
                                </span>
                            </div>
                            {game.ids.map(([label, hint, example]) => (
                                <div
                                    key={label}
                                    className="flex justify-between gap-2.5 border-t border-dashed border-bg py-1.5 text-xs"
                                >
                                    <span className="text-muted">
                                        {label}
                                        <br />
                                        <span className="text-[10.5px] text-dim">
                                            {hint}
                                        </span>
                                    </span>
                                    <span className="text-right font-semibold text-text tabular-nums">
                                        {example}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ))}
                    <button
                        type="button"
                        className="flex min-h-[150px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-lav text-muted hover:border-text hover:text-text"
                    >
                        <svg
                            width={22}
                            height={22}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        Add game
                    </button>
                </div>
            </Panel>
        </AdminLayout>
    );
}
