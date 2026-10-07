// Ported from design/admin-dashboard.html's #lightboxOverlay — click a jacket to see it at full
// (1:1, square) size. Takes a raw CSS `background` value so it always shows exactly what the
// thumbnail shows (gradient placeholder or a real image layered on top of it), never a separate source.
import { useEffect } from 'react';

export function Lightbox({
    background,
    onClose,
}: {
    background: string;
    onClose: () => void;
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
            className="fixed inset-0 z-60 flex cursor-zoom-out items-center justify-center bg-[#06060f]/82 p-8 backdrop-blur-[3px]"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="fixed top-[22px] right-[26px] z-[61] flex size-[38px] items-center justify-center rounded-xl bg-card-alt hover:bg-lav"
            >
                ✕
            </button>
            <div
                className="aspect-square w-[min(74vw,560px)] rounded-[22px] bg-cover bg-center shadow-[0_24px_64px_-16px_rgba(0,0,0,.6)]"
                style={{ background }}
            />
        </div>
    );
}
