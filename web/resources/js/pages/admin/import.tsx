import { Notice, Panel, PanelHead } from '@/components/admin/ui';
import AdminLayout from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';

const RECENT_IMPORTS = [
    {
        file: 'celestl:import-arcaea-content',
        new: 563,
        updated: 0,
        failed: 0,
        by: 'php artisan',
        when: 'local, on demand',
    },
];

export default function AdminImport() {
    return (
        <AdminLayout title="CSV import">
            <Head title="Admin · CSV import" />

            <Notice tone="warn">
                <b>Jalur CSV belum ada.</b> Task 1.3 akhirnya memilih import
                langsung dari{' '}
                <code className="font-mono text-[11px]">data/*.json</code>{' '}
                (sumber sudah tervalidasi silang, lihat CLAUDE.md), bukan CSV —
                jadi drop zone di bawah ini murni pratinjau antarmuka, belum
                tersambung endpoint apa pun. Import sungguhan dijalankan lewat
                artisan command di server.
            </Notice>

            <Panel>
                <PanelHead
                    title="Import chart constants"
                    description="Jalur CSV alternatif (belum dibangun) untuk koreksi/tambahan ad hoc di luar data/*.json."
                />
                <div className="mx-4 mb-4 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-lav px-4 py-7 text-center text-muted">
                    <svg
                        width={26}
                        height={26}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path d="M12 4v11m0 0 4-4m-4 4-4-4M5 19h14" />
                    </svg>
                    <b className="text-[13.5px] text-text">
                        Drop CSV file here
                    </b>
                    <span className="text-xs">
                        title, artist, pack, difficulty, level, constant,
                        note_count
                    </span>
                </div>
            </Panel>

            <Panel>
                <PanelHead
                    title="Recent imports"
                    description="Satu baris nyata: hasil terakhir celestl:import-arcaea-content di database lokal. Belum ada riwayat historis tersimpan (artisan command tidak mencatat log import ke tabel)."
                />
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px] border-collapse">
                        <thead>
                            <tr>
                                {[
                                    'File',
                                    'New',
                                    'Updated',
                                    'Failed',
                                    'By',
                                    'When',
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="bg-card-alt px-4 py-2 text-left text-[10.5px] tracking-[0.08em] text-dim uppercase"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {RECENT_IMPORTS.map((row) => (
                                <tr
                                    key={row.file}
                                    className="border-t border-bg"
                                >
                                    <td className="px-4 py-3 font-mono text-[12.5px]">
                                        {row.file}
                                    </td>
                                    <td className="px-4 py-3 text-ok tabular-nums">
                                        {row.new}
                                    </td>
                                    <td className="px-4 py-3 tabular-nums">
                                        {row.updated}
                                    </td>
                                    <td className="px-4 py-3 tabular-nums">
                                        {row.failed > 0 ? (
                                            <span className="text-bad">
                                                {row.failed}
                                            </span>
                                        ) : (
                                            row.failed
                                        )}
                                    </td>
                                    <td className="px-4 py-3">{row.by}</td>
                                    <td className="px-4 py-3 text-dim">
                                        {row.when}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Panel>
        </AdminLayout>
    );
}
