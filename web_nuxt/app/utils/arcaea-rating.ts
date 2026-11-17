export const LAMPS = [
    'lost',
    'easy_clear',
    'normal_clear',
    'hard_clear',
    'full_recall',
    'pure_memory',
] as const;

export type Lamp = (typeof LAMPS)[number];

export const GRADES = ['D', 'C', 'B', 'A', 'AA', 'EX', 'EX+'] as const;

export type Grade = (typeof GRADES)[number];

/** Every clear lamp is worth the same bonus; Lost is worth nothing. */
export const CLEAR_BONUS = 0.2;

export function isClear(lamp: Lamp): boolean {
    return lamp !== 'lost';
}

/**
 * Score component of a play rating, before the chart constant and the clear bonus.
 */
export function modifier(score: number): number {
    if (score >= 10_000_000) {
        return 2.0;
    }

    if (score >= 9_800_000) {
        return 1.0 + (score - 9_800_000) / 200_000;
    }

    return (score - 9_500_000) / 300_000;
}

/**
 * max(0, constant + modifier) + bonus.
 *
 * The floor applies *before* the bonus, so a chart floored to 0 still earns +0.2 when cleared.
 */
export function playRating(constant: number, score: number, lamp: Lamp): number {
    const base = Math.max(0, constant + modifier(score));

    return base + (isClear(lamp) ? CLEAR_BONUS : 0);
}

/** Grade comes from the score alone -- a perfect score is still EX+, since PM is a lamp. */
export function grade(score: number): Grade {
    if (score >= 9_900_000) return 'EX+';
    if (score >= 9_800_000) return 'EX';
    if (score >= 9_500_000) return 'AA';
    if (score >= 9_200_000) return 'A';
    if (score >= 9_000_000) return 'B';
    if (score >= 8_800_000) return 'C';

    return 'D';
}

/** Arcaea prints scores in groups of three with a curly quote: 09’998’593. */
export function formatScore(score: number): string {
    return String(Math.max(0, Math.trunc(score)))
        .padStart(8, '0')
        .replace(/\B(?=(\d{3})+(?!\d))/g, '’');
}
