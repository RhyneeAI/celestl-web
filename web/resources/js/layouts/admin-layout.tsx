import {
    GamesIcon,
    HomeIcon,
    ImportIcon,
    LogIcon,
    PacksIcon,
    SearchIcon,
    SongsIcon,
    TestingIcon,
    UsersIcon,
} from '@/components/admin/nav-icons';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import type { ComponentType, PropsWithChildren, SVGProps } from 'react';

type NavItem = {
    href: string;
    label: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
};

type NavGroup = {
    label: string | null;
    items: NavItem[];
};

// Mirrors design/admin-dashboard.html's sidebar exactly: 8 pages, same 4 groups
// (ungrouped Home, then Content / People / Operations).
const NAV_GROUPS: NavGroup[] = [
    { label: null, items: [{ href: '/admin', label: 'Home', icon: HomeIcon }] },
    {
        label: 'Content',
        items: [
            { href: '/admin/packs', label: 'Packs', icon: PacksIcon },
            { href: '/admin/songs', label: 'Songs & charts', icon: SongsIcon },
        ],
    },
    {
        label: 'People',
        items: [
            { href: '/admin/users', label: 'Users', icon: UsersIcon },
            { href: '/admin/games', label: 'Game management', icon: GamesIcon },
        ],
    },
    {
        label: 'Operations',
        items: [
            { href: '/admin/log', label: 'Activity log', icon: LogIcon },
            { href: '/admin/import', label: 'CSV import', icon: ImportIcon },
            {
                href: '/admin/testing',
                label: 'Testing tools',
                icon: TestingIcon,
            },
        ],
    },
];

function isActive(currentUrl: string, href: string): boolean {
    // "/admin" must match exactly (it is a prefix of every other admin route),
    // the rest match on prefix so nothing extra is needed as sub-pages grow.
    return href === '/admin'
        ? currentUrl === '/admin'
        : currentUrl.startsWith(href);
}

export default function AdminLayout({
    title,
    children,
}: PropsWithChildren<{ title: string }>) {
    const { url } = usePage();

    return (
        <div className="grid min-h-screen grid-cols-[224px_1fr] bg-bg text-text">
            <aside className="sticky top-0 flex h-screen flex-col gap-0.5 overflow-y-auto bg-card px-3.5 py-5">
                <div className="flex items-center gap-2.5 px-2 pt-1 pb-5">
                    <div className="size-7 flex-none rotate-45 rounded-[9px] bg-lav" />
                    <b className="font-brand text-[17px] font-semibold tracking-wide">
                        CELESTL
                    </b>
                </div>
                <nav className="flex flex-col gap-0.5">
                    {NAV_GROUPS.map((group, i) => (
                        <div key={group.label ?? `group-${i}`}>
                            {group.label && (
                                <div className="px-3 pt-3.5 pb-1 text-[10.5px] font-bold tracking-[0.14em] text-dim uppercase">
                                    {group.label}
                                </div>
                            )}
                            {group.items.map((item) => {
                                const active = isActive(url, item.href);
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold text-muted',
                                            active
                                                ? 'bg-violet text-text'
                                                : 'hover:bg-card-alt hover:text-text',
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                'flex-none',
                                                active
                                                    ? 'text-pst opacity-100'
                                                    : 'opacity-85',
                                            )}
                                        />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>
                <footer className="mt-auto pt-2.5 text-[11px] text-dim">
                    ver 1.xx · admin
                </footer>
            </aside>

            <div className="flex min-w-0 flex-col">
                <header className="sticky top-0 z-[5] flex flex-wrap items-center gap-3.5 bg-bg px-6 py-3.5">
                    <div className="flex items-center gap-1.5 text-[13px] text-muted">
                        <span>Admin</span>
                        <span className="text-dim">›</span>
                        <b className="font-semibold text-text">{title}</b>
                    </div>
                    <div className="relative ml-auto max-w-[360px] min-w-[160px] flex-1">
                        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-dim" />
                        <label htmlFor="q" className="absolute left-[-9999px]">
                            Search songs
                        </label>
                        <input
                            id="q"
                            type="search"
                            placeholder="Search songs…"
                            autoComplete="off"
                            className="w-full rounded-xl bg-card py-2.5 pr-3.5 pl-9 text-[13.5px] text-text placeholder:text-dim focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2.5">
                        <div className="grid size-[30px] flex-none place-items-center rounded-full bg-badge text-xs font-bold">
                            A
                        </div>
                        <div className="leading-[1.25]">
                            <div className="text-[12.5px] font-bold">
                                AnisphiaaaUwU
                            </div>
                            <div className="font-mono text-[10.5px] text-muted tabular-nums">
                                160 500 737
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex flex-col gap-[18px] px-6 pt-4 pb-9">
                    {children}
                </main>
            </div>
        </div>
    );
}
