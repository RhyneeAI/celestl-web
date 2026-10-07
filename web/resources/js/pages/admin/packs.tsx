import { Panel, PanelHead } from '@/components/admin/ui';
import { Modal, ModalField, modalInputClass } from '@/components/admin/modal';
import AdminLayout from '@/layouts/admin-layout';
import { jacketGradient } from '@/lib/jacket';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

type ChildPack = { id: number; slug: string; name: string };

type PackCard = {
    id: number;
    slug: string;
    name: string;
    song_count: number;
    children: ChildPack[];
};

type Section = { label: string; packs: PackCard[] };

type Props = {
    sections: Section[];
    totalPacks: number;
    sectionOrder: string[];
    topLevelPacks: { id: number; name: string }[];
};

// Real pack/jacket art is never shipped with this app (copyright, see CLAUDE.md § Data dan hak
// cipta) -- if it happens to exist locally on the public disk (storage:link + manually dropped
// files, same opt-in idea as the old mockup), it layers on top; otherwise this gradient shows.
function packBackground(slug: string, name: string): string {
    return `url(/storage/packs/${slug}.png), ${jacketGradient(name)}`;
}

function goToSongs(packName: string) {
    router.visit(`/admin/songs?pack=${encodeURIComponent(packName)}`);
}

export default function AdminPacks({
    sections,
    totalPacks,
    sectionOrder,
    topLevelPacks,
}: Props) {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <AdminLayout title="Packs">
            <Head title="Admin · Packs" />

            <Panel>
                <PanelHead
                    title="Packs"
                    count={`${totalPacks} packs`}
                    actions={
                        <button
                            type="button"
                            onClick={() => setModalOpen(true)}
                            className="rounded-[11px] bg-lav px-3.5 py-2 text-[12.5px] font-semibold text-text hover:bg-[#4a4780]"
                        >
                            + Add pack
                        </button>
                    }
                    description={
                        <>
                            Dikelompokkan per kategori dengan pita label, meniru
                            struktur{' '}
                            <code className="font-mono text-[11px]">
                                arcaea.miraheze.org/wiki/Pack_list
                            </code>{' '}
                            (cuma tata letaknya — warna & font tetap Celestl).
                            Pack dengan chapter tambahan ditandai di bawah
                            kartunya. Klik pack atau chapter untuk membuka Songs
                            & charts yang sudah difilter.
                        </>
                    }
                />

                <div className="flex flex-col gap-7 p-[18px]">
                    {sections.map((section) => (
                        <div
                            key={section.label}
                            className="flex items-start gap-4"
                        >
                            <div className="flex min-h-[160px] w-[30px] flex-none items-center justify-center self-stretch rounded-lg bg-violet">
                                <span className="rotate-180 font-brand text-xs font-semibold tracking-[0.1em] whitespace-nowrap text-prs uppercase [writing-mode:vertical-rl]">
                                    {section.label}
                                </span>
                            </div>
                            <div className="flex min-w-0 flex-1 flex-wrap gap-x-3.5 gap-y-4">
                                {section.packs.map((pack) => (
                                    <div
                                        key={pack.id}
                                        className="flex w-[168px] flex-col gap-1.5"
                                    >
                                        <div className="text-center text-[10.5px] font-semibold text-muted">
                                            {pack.song_count} song
                                            {pack.song_count === 1 ? '' : 's'}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => goToSongs(pack.name)}
                                            className="group relative aspect-[168/150] w-full overflow-hidden rounded-[14px]"
                                        >
                                            <div
                                                className="absolute inset-0 bg-cover bg-center"
                                                style={{
                                                    background: packBackground(
                                                        pack.slug,
                                                        pack.name,
                                                    ),
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,12,34,0)_35%,rgba(12,12,34,.92)_100%)]" />
                                            <div className="absolute inset-x-3 bottom-3 text-left">
                                                <b className="block text-[13.5px] leading-[1.25] font-bold group-hover:underline">
                                                    {pack.name}
                                                </b>
                                            </div>
                                        </button>
                                        {pack.children.length > 0 && (
                                            <div className="flex flex-col gap-1">
                                                {pack.children.map((child) => (
                                                    <button
                                                        key={child.id}
                                                        type="button"
                                                        onClick={() =>
                                                            goToSongs(
                                                                child.name,
                                                            )
                                                        }
                                                        className="group relative block h-[26px] w-full overflow-hidden rounded-md bg-cover bg-center"
                                                        style={{
                                                            backgroundImage:
                                                                packBackground(
                                                                    child.slug,
                                                                    child.name,
                                                                ),
                                                        }}
                                                    >
                                                        <div className="absolute inset-0 bg-[#0c0c22]/55 group-hover:bg-[#3f3c68]/55" />
                                                        <b className="relative z-10 flex h-full items-center justify-center overflow-hidden px-2 text-[10px] font-semibold text-ellipsis whitespace-nowrap text-text group-hover:underline">
                                                            {child.name}
                                                        </b>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Panel>

            {modalOpen && (
                <AddPackModal
                    sectionOrder={sectionOrder}
                    topLevelPacks={topLevelPacks}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </AdminLayout>
    );
}

function AddPackModal({
    sectionOrder,
    topLevelPacks,
    onClose,
}: {
    sectionOrder: string[];
    topLevelPacks: { id: number; name: string }[];
    onClose: () => void;
}) {
    return (
        <Modal
            title="Add pack"
            subtitle="Pack baru untuk Arcaea. Kategori menentukan pita label tempat pack ini dikelompokkan di halaman ini."
            onClose={onClose}
            onSave={onClose}
        >
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                <ModalField label="Pack name">
                    <input
                        className={modalInputClass}
                        placeholder="Pack name"
                        autoFocus
                    />
                </ModalField>
                <ModalField label="Category">
                    <select className={modalInputClass}>
                        {sectionOrder.map((s) => (
                            <option key={s}>{s}</option>
                        ))}
                    </select>
                </ModalField>
                <ModalField label="Parent pack (optional)">
                    <select className={modalInputClass} defaultValue="">
                        <option value="">None — top-level pack</option>
                        {topLevelPacks.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </ModalField>
                <label className="col-span-2 flex flex-row items-center gap-2">
                    <input type="checkbox" />
                    <span className="text-[12.5px] font-semibold text-text normal-case">
                        Small pack image (nama file wiki pakai awalan
                        &quot;small_&quot;)
                    </span>
                </label>
            </div>
            <p className="mt-3 text-[11px] leading-[1.6] text-dim">
                Isi &quot;Parent pack&quot; kalau ini chapter/append tambahan
                (mis. &quot;Lasting Eden Chapter 2&quot;) — gambarnya nanti ikut
                gambar pack induk, sesuai cara game menampilkannya. Kosongkan
                untuk pack mandiri.
            </p>
        </Modal>
    );
}
