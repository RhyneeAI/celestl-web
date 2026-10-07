// Generic modal shell ported from design/admin-dashboard.html's #modalOverlay — used for "Add
// song"/"Add pack" (and anything else that needs a blank-form dialog rather than inline editing).
// Prototype only: callers decide what onSave does, but nothing here persists by itself.
import { useEffect } from 'react';

export function Modal({
    title,
    subtitle,
    onClose,
    onSave,
    saveLabel = 'Save',
    footnote = 'Prototipe — belum tersambung backend, tidak benar-benar tersimpan.',
    children,
}: {
    title: string;
    subtitle?: string;
    onClose: () => void;
    onSave: () => void;
    saveLabel?: string;
    footnote?: string;
    children: React.ReactNode;
}) {
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKeyDown);

        return () => document.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#06060f]/82 p-5 backdrop-blur-[3px]"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="max-h-[calc(100vh-40px)] w-full max-w-[440px] overflow-y-auto rounded-[24px] bg-card px-6 py-[22px]">
                <div className="mb-0.5 flex items-center gap-2.5">
                    <h2 className="flex-1 text-[17px] font-bold">{title}</h2>
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={onClose}
                        className="flex size-6 flex-none items-center justify-center rounded-[7px] border border-lav bg-card-alt text-sm hover:border-text"
                    >
                        ✕
                    </button>
                </div>
                {subtitle && (
                    <p className="mb-3.5 text-xs text-muted">{subtitle}</p>
                )}
                {children}
                <div className="mt-4 flex items-center gap-2.5 border-t border-dashed border-bg pt-3.5">
                    <button
                        type="button"
                        onClick={onSave}
                        className="rounded-[11px] bg-lav px-3.5 py-2 text-[12.5px] font-semibold text-text hover:bg-[#4a4780]"
                    >
                        {saveLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-[11px] border border-dashed border-lav px-3.5 py-2 text-[12.5px] font-semibold text-muted hover:border-text hover:text-text"
                    >
                        Cancel
                    </button>
                    <span className="text-[11px] text-dim">{footnote}</span>
                </div>
            </div>
        </div>
    );
}

export function ModalField({
    label,
    full = true,
    children,
}: {
    label: string;
    full?: boolean;
    children: React.ReactNode;
}) {
    return (
        <label
            className={
                full
                    ? 'col-span-2 flex flex-col gap-0.5'
                    : 'flex flex-col gap-0.5'
            }
        >
            <span className="text-[10.5px] font-bold tracking-[0.08em] text-muted uppercase">
                {label}
            </span>
            {children}
        </label>
    );
}

export const modalInputClass =
    'w-full rounded-lg border border-lav bg-bg px-2.5 py-[9px] text-[13.5px] text-text focus:border-pst focus:outline-none';
