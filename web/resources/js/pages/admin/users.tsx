import { Notice, Panel, PanelHead } from '@/components/admin/ui';
import { USERS } from '@/data/admin-examples';
import AdminLayout from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

export default function AdminUsers() {
    const [query, setQuery] = useState('');

    const filtered = USERS.filter(([name, , , identity]) => {
        const q = query.trim().toLowerCase();

        return (
            !q ||
            name.toLowerCase().includes(q) ||
            identity.toLowerCase().includes(q)
        );
    });

    return (
        <AdminLayout title="Users">
            <Head title="Admin · Users" />

            <Notice>
                <b>Identitas per game.</b> Saat ini hanya Arcaea, jadi tiap user
                punya satu chip identitas. Rencana multi-game: satu akun Celestl
                bisa punya banyak chip (satu per game) — lihat § Rencana jauh:
                multi-game identity di CLAUDE.md.
            </Notice>

            <Notice tone="warn">
                <b>Data contoh.</b> Belum ada sistem akun (Fase 4) — tabel di
                bawah bukan data pengguna sungguhan.
            </Notice>

            <Panel>
                <PanelHead
                    title="Users"
                    count={`${USERS.length} users (contoh)`}
                    actions={
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search nickname or Player ID…"
                            className="w-[220px] rounded-[10px] bg-card-alt px-3 py-1.5 text-[12.5px] text-text placeholder:text-dim focus:outline-none"
                        />
                    }
                />
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] border-collapse">
                        <thead>
                            <tr>
                                {[
                                    'User',
                                    'Game identity',
                                    'Joined',
                                    'Last active',
                                    'Status',
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
                            {filtered.map(
                                ([
                                    name,
                                    avatar,
                                    game,
                                    identity,
                                    joined,
                                    active,
                                    state,
                                ]) => (
                                    <tr
                                        key={name}
                                        className="border-t border-bg"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="grid size-[26px] flex-none place-items-center rounded-full bg-badge text-[10px] font-bold">
                                                    {avatar}
                                                </div>
                                                <b className="font-bold">
                                                    {name}
                                                </b>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="rounded-lg bg-violet px-2.5 py-0.5 text-[10.5px] font-bold text-pst">
                                                {game}
                                            </span>{' '}
                                            <span className="text-[11.5px] text-dim tabular-nums">
                                                {identity}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-dim">
                                            {joined}
                                        </td>
                                        <td className="px-4 py-3 text-dim">
                                            {active}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={
                                                    state === 'warn'
                                                        ? 'rounded-full bg-warn/12 px-2.5 py-0.5 text-[10px] font-bold text-warn'
                                                        : 'rounded-full bg-ok/12 px-2.5 py-0.5 text-[10px] font-bold text-ok'
                                                }
                                            >
                                                {state === 'warn'
                                                    ? 'no upload yet'
                                                    : 'active'}
                                            </span>
                                        </td>
                                    </tr>
                                ),
                            )}
                        </tbody>
                    </table>
                </div>
            </Panel>
        </AdminLayout>
    );
}
