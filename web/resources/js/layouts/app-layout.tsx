import { useTranslations } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';

/**
 * Public (player-facing) shell. Dark at every width — the owner confirmed the Figma desktop frame
 * is not final and must not be used as a reference, so the wide layout is derived from the mobile
 * frames instead: same palette, same components, just more room (CLAUDE.md § Bahasa visual Figma).
 *
 * The Figma mobile header shows the game's logo; that is deliberately dropped here because game
 * branding must never ship in this repo (CLAUDE.md § Data dan hak cipta).
 */
export default function AppLayout({
    children,
    back,
}: PropsWithChildren<{ back?: { href: string; label?: string } }>) {
    const t = useTranslations();
    const { url } = usePage();

    const nav = [
        { href: '/', label: t('nav.songs'), match: (u: string) => u === '/' || u.startsWith('/songs') },
        { href: '/packs', label: t('nav.packs'), match: (u: string) => u.startsWith('/packs') },
    ];

    return (
        <div className="flex min-h-screen flex-col bg-bg text-text">
            <header className="sticky top-0 z-10 bg-bg/95 backdrop-blur">
                <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3.5 sm:px-6">
                    <Link href="/" className="font-brand text-[17px] font-semibold tracking-wide">
                        {t('brand')}
                    </Link>
                    <nav className="ml-auto flex items-center gap-1">
                        {nav.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'rounded-xl px-3 py-1.5 text-[13.5px] font-semibold',
                                    item.match(url)
                                        ? 'bg-violet text-text'
                                        : 'text-muted hover:bg-card-alt hover:text-text',
                                )}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </header>

            <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-10 sm:px-6">
                {back && (
                    <Link
                        href={back.href}
                        className="mb-3 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-muted hover:text-text"
                    >
                        <svg
                            width={16}
                            height={16}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.5}
                        >
                            <path d="M15 5l-7 7 7 7" />
                        </svg>
                        {back.label ?? t('nav.back')}
                    </Link>
                )}
                {children}
            </main>

            <footer className="pb-6 text-center text-[11px] text-dim">{t('version')}</footer>
        </div>
    );
}
