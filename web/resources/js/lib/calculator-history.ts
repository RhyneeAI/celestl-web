import type { Lamp } from '@/lib/arcaea-rating';

/**
 * The signed-out player's saved calculations, kept in their own browser.
 *
 * The owner's decision: with no accounts yet (Fase 4), nothing goes to the server. That also
 * matches the guest mode CLAUDE.md § Akun asks for -- the calculator is usable without storing
 * history server-side. The `plays` table exists for when there is an account to own the rows.
 *
 * Every read and write is guarded: localStorage throws in a private window, and a corrupt or
 * hand-edited value must not take the page down with it.
 */
const KEY = 'celestl.calculator.history.v1';

export type HistoryEntry = {
    id: string;
    slug: string;
    title: string;
    difficulty: string;
    constant: number;
    score: number;
    lamp: Lamp;
    rating: number;
    playedAt: string;
};

export function readHistory(): HistoryEntry[] {
    try {
        const raw = window.localStorage.getItem(KEY);
        if (!raw) return [];

        const parsed: unknown = JSON.parse(raw);

        return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : [];
    } catch {
        return [];
    }
}

export function writeHistory(entries: HistoryEntry[]): void {
    try {
        window.localStorage.setItem(KEY, JSON.stringify(entries));
    } catch {
        // Full or blocked storage: the calculation itself still worked, so say nothing and let the
        // page carry on rather than failing in front of the player.
    }
}
