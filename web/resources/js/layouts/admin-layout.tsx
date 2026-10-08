import {
    GamesIcon,
    HomeIcon,
    ImportIcon,
    LogIcon,
    PacksIcon,
    SearchIcon,
    SongsIcon,
    TestingIcon,
    UnofficialIcon,
    UsersIcon,
} from '@/components/admin/nav-icons';
import { cn } from '@/lib/utils';
import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
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

// Mirrors design/admin-dashboard.html's sidebar (8 pages, Content/People/Operations) plus one
// group the mockup never had: "Unofficial" (private server custom charts) -- kept as its own
// group, not folded into Content, because its data is deliberately segmented from the official
// songs/packs/charts catalog above it. See CLAUDE.md § Unofficial.
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
        label: 'Unofficial',
        items: [
            {
                href: '/admin/unofficial',
                label: 'Custom charts',
                icon: UnofficialIcon,
            },
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
    const [navOpen, setNavOpen] = useState(false);

    // Laptop keeps the sidebar permanently in the grid; below that it becomes a drawer, so it has
    // to close itself after a navigation or it would cover the page it just opened.
    useEffect(() => setNavOpen(false), [url]);

    return (
        <div className="min-h-screen bg-bg text-text lg:grid lg:grid-cols-[224px_1fr]">
            {/* Tapping the page behind an open drawer closes it, as a drawer is expected to. */}
            {navOpen && (
                <button
                    type="button"
                    aria-label="Close menu"
                    onClick={() => setNavOpen(false)}
                    className="fixed inset-0 z-20 bg-bg/70 lg:hidden"
                />
            )}

            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-30 flex w-[244px] flex-col gap-0.5 overflow-y-auto bg-card px-3.5 py-5 transition-transform',
                    'lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-auto lg:translate-x-0 lg:transition-none',
                    navOpen ? 'translate-x-0' : '-translate-x-full',
                )}
            >
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
                <div className="mt-auto pt-2.5">
                    <button
                        type="button"
                        onClick={() => router.post('/admin/logout')}
                        className="w-full rounded-xl px-3 py-2.5 text-left text-[13.5px] font-semibold text-muted hover:bg-card-alt hover:text-text"
                    >
                        Sign out
                    </button>
                    <footer className="px-3 pt-2.5 text-[11px] text-dim">
                        ver 1.xx · admin
                    </footer>
                </div>
            </aside>

            <div className="flex min-w-0 flex-col">
                <header className="sticky top-0 z-[5] flex flex-wrap items-center gap-x-3.5 gap-y-2.5 bg-bg px-4 py-3.5 sm:px-6">
                    <button
                        type="button"
                        onClick={() => setNavOpen(true)}
                        aria-label="Open menu"
                        aria-expanded={navOpen}
                        className="-ml-1 rounded-lg p-1.5 text-muted hover:bg-card hover:text-text lg:hidden"
                    >
                        <svg
                            width={20}
                            height={20}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                        >
                            <path d="M4 7h16M4 12h16M4 17h16" />
                        </svg>
                    </button>

                    <div className="flex min-w-0 items-center gap-1.5 text-[13px] text-muted">
                        <span className="hidden sm:inline">Admin</span>
                        <span className="hidden text-dim sm:inline">›</span>
                        <b className="truncate font-semibold text-text">
                            {title}
                        </b>
                    </div>

                    {/*
                     * On a phone the search field takes the whole second row rather than being
                     * squeezed next to the breadcrumb, where it would be too narrow to type in.
                     */}
                    <div className="relative order-last w-full sm:order-none sm:ml-auto sm:w-auto sm:max-w-[360px] sm:min-w-[160px] sm:flex-1">
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

                    <div className="ml-auto flex items-center gap-2.5 sm:ml-0">
                        <div className="grid size-[30px] flex-none place-items-center rounded-full bg-badge text-xs font-bold">
                            A
                        </div>
                        {/* The player id is the useful half; the nickname goes first when space allows. */}
                        <div className="hidden leading-[1.25] md:block">
                            <div className="text-[12.5px] font-bold">
                                AnisphiaaaUwU
                            </div>
                            <div className="font-mono text-[10.5px] text-muted tabular-nums">
                                160 500 737
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex flex-col gap-[18px] px-4 pt-4 pb-9 sm:px-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
