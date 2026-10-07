import { Notice, Panel, PanelHead } from '@/components/admin/ui';
import {
    LOG,
    TYPE_COLOR,
    TYPE_LABEL,
    type LogType,
} from '@/data/admin-examples';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

const CHIP_DEFS: [key: string, label: string][] = [
    ['all', 'All'],
    ['upload', 'Best 50'],
    ['import', 'CSV import'],
    ['edit', 'Admin edit'],
    ['review', 'Needs review'],
];

export default function AdminLog() {
    const [active, setActive] = useState<Set<string>>(new Set(['all']));

    function toggle(key: string) {
        setActive((prev) => {
            const next = new Set(prev);
            if (key === 'all') {
                next.clear();
                next.add('all');
            } else {
                next.delete('all');
                if (next.has(key)) {
                    next.delete(key);
                } else {
                    next.add(key);
                }
                if (next.size === 0) next.add('all');
            }

            return next;
        });
    }

    const items = LOG.filter(
        ([type, , , , state]) =>
            active.has('all') ||
            active.has(type) ||
            (active.has('review') && state !== 'ok'),
    );

    return (
        <AdminLayout title="Activity log">
            <Head title="Admin · Activity log" />

            <Notice tone="warn">
                <b>Data contoh.</b> Belum ada sistem upload Best 50/import CSV
                sungguhan — linimasa di bawah bukan kejadian nyata.
            </Notice>

            <Panel>
                <PanelHead
                    title="Activity log"
                    count={`${items.length} entries`}
                    description='Mencakup unggahan Best 50, import CSV, dan perubahan admin dalam satu linimasa. Pakai filter "Needs review" untuk antrean yang butuh keputusanmu (nickname tidak cocok, baris CSV gagal, lagu tak dikenali OCR).'
                />
                <div className="flex flex-wrap items-center gap-1.5 px-4 pb-3.5">
                    {CHIP_DEFS.map(([key, label]) => (
                        <button
                            key={key}
                            type="button"
                            aria-pressed={active.has(key)}
                            onClick={() => toggle(key)}
                            className={cn(
                                'rounded-[9px] px-3 py-1.5 text-[11.5px] font-bold tracking-[0.02em]',
                                active.has(key)
                                    ? 'bg-lav text-text'
                                    : 'bg-card-alt text-muted',
                            )}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <div className="flex flex-col">
                    {items.map(([type, who, desc, when, state], i) => (
                        <div
                            key={i}
                            className="flex flex-col gap-1.5 border-t border-bg px-4 py-[11px] first:border-t-0"
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className={cn(
                                        'rounded-full px-2.5 py-0.5 text-[10px] font-bold text-text',
                                        TYPE_COLOR[type as LogType],
                                    )}
                                >
                                    {TYPE_LABEL[type as LogType]}
                                </span>
                                <b className="flex-1 overflow-hidden text-[12.5px] font-bold text-ellipsis whitespace-nowrap">
                                    {who !== '—' ? `${who} ` : ''}
                                    {desc}
                                </b>
                                <span
                                    className={cn(
                                        'rounded-full px-2.5 py-0.5 text-[10px] font-bold',
                                        state === 'ok' && 'bg-ok/12 text-ok',
                                        state === 'warn' &&
                                            'bg-warn/12 text-warn',
                                        state === 'bad' && 'bg-bad/12 text-bad',
                                    )}
                                >
                                    {state === 'ok'
                                        ? 'ok'
                                        : state === 'warn'
                                          ? 'review'
                                          : 'failed'}
                                </span>
                            </div>
                            <div className="text-[10.5px] text-dim">{when}</div>
                        </div>
                    ))}
                </div>
            </Panel>
        </AdminLayout>
    );
}
