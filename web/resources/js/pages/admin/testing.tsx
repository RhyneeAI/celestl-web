import { Notice, Panel, PanelHead } from '@/components/admin/ui';
import AdminLayout from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';

const CONFIDENCE_ROWS: {
    label: string;
    value: string;
    percent: number;
    color: string;
}[] = [
    {
        label: 'Nickname match',
        value: 'AnisphiaaaUwU · 97%',
        percent: 97,
        color: 'bg-ok',
    },
    { label: 'Cards read', value: '50 / 50', percent: 100, color: 'bg-pst' },
    {
        label: 'Score field confidence',
        value: '94%',
        percent: 94,
        color: 'bg-pst',
    },
    { label: 'Jacket hash match', value: '89%', percent: 89, color: 'bg-ftr' },
];

export default function AdminTesting() {
    return (
        <AdminLayout title="Testing tools">
            <Head title="Admin · Testing tools" />

            <Notice tone="warn">
                <b>Belum fungsional.</b> Layanan{' '}
                <code className="font-mono text-[11px]">vision/</code> belum
                dibangun (Fase 3 di TASKS.md). Ini pratinjau antarmuka saja —
                OCR dan hash jacket belum jalan sungguhan.
            </Notice>

            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
                <Panel>
                    <PanelHead
                        title="Best 50 OCR tester"
                        description="Unggah gambar Best 50 untuk melihat apa yang akan dibaca vision/, sebelum dipakai di alur upload pengguna."
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
                            <rect x={4} y={4} width={16} height={16} rx={3} />
                            <path d="M9 14l2.5-3 2 2.2L16 10l3 4" />
                        </svg>
                        <b className="text-[13.5px] text-text">
                            Drop Best 50 image
                        </b>
                        <span className="text-xs">
                            PNG dari halaman resmi Arcaea, grid 5×10
                        </span>
                    </div>
                </Panel>

                <Panel>
                    <PanelHead title="Example output" count="mock" />
                    <div className="flex flex-col gap-2.5 p-4">
                        {CONFIDENCE_ROWS.map((row) => (
                            <div key={row.label}>
                                <div className="mb-1 flex justify-between text-xs">
                                    <span>{row.label}</span>
                                    <b className="font-bold">{row.value}</b>
                                </div>
                                <div className="h-1 overflow-hidden rounded-[3px] bg-bg">
                                    <div
                                        className={`h-full ${row.color}`}
                                        style={{ width: `${row.percent}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>
            </div>
        </AdminLayout>
    );
}
