// Small shared building blocks ported from design/admin-dashboard.html's .notice/.panel/.phead/.btn
// classes. Reused across the admin Home/Packs/Songs & charts pages (and beyond).
import { cn } from '@/lib/utils';
import type { PropsWithChildren, ReactNode } from 'react';

export function Notice({
    tone = 'default',
    children,
}: PropsWithChildren<{ tone?: 'default' | 'ok' | 'warn' }>) {
    return (
        <div
            className={cn(
                'rounded-[14px] bg-violet px-[15px] py-[11px] text-[12.5px] leading-[1.6] text-text/90',
                '[&_b]:font-bold',
                tone === 'ok' && '[&_b]:text-ok',
                tone === 'warn' && '[&_b]:text-warn',
                tone === 'default' && '[&_b]:text-prs',
            )}
        >
            {children}
        </div>
    );
}

export function Panel({ children }: PropsWithChildren) {
    return (
        <section className="overflow-hidden rounded-2xl bg-card">
            {children}
        </section>
    );
}

export function PanelHead({
    title,
    count,
    description,
    actions,
}: {
    title: string;
    count?: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
}) {
    return (
        <div className="flex flex-wrap items-center gap-2.5 px-4 py-[13px]">
            <h2 className="text-[15px] font-semibold">{title}</h2>
            {count && (
                <span className="rounded-full bg-card-alt px-[9px] py-[2px] text-[11px] font-bold text-muted">
                    {count}
                </span>
            )}
            {actions && (
                <span className="ml-auto flex items-center gap-2">
                    {actions}
                </span>
            )}
            {description && (
                <p className="mt-0.5 w-full text-[11.5px] text-muted">
                    {description}
                </p>
            )}
        </div>
    );
}

export function Btn({
    variant = 'solid',
    className,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'solid' | 'ghost';
}) {
    return (
        <button
            type="button"
            className={cn(
                'rounded-[11px] px-3.5 py-2 text-[12.5px] font-semibold',
                variant === 'solid' && 'bg-lav text-text hover:bg-[#4a4780]',
                variant === 'ghost' &&
                    'border border-dashed border-lav bg-transparent text-muted hover:border-text hover:text-text',
                className,
            )}
            {...props}
        />
    );
}
