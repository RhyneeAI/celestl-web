// Shared across admin pages that show per-difficulty data (Home's breakdown, Songs & charts'
// table/tags). Order matches App\Difficulty's enum case order (PST/PRS/FTR/BYD/ETR/INS).
export const DIFFICULTY_ORDER = [
    'PST',
    'PRS',
    'FTR',
    'BYD',
    'ETR',
    'INS',
] as const;

export type DifficultyCode = (typeof DIFFICULTY_ORDER)[number];

// [text color class, bg color class] -- tokens defined in resources/css/app.css's @theme, see
// CLAUDE.md § Warna BYD/ETR/INS for where each hex value came from.
export const DIFFICULTY_COLOR: Record<
    DifficultyCode,
    [text: string, bg: string]
> = {
    PST: ['text-pst', 'bg-pst'],
    PRS: ['text-prs', 'bg-prs'],
    FTR: ['text-ftr', 'bg-ftr'],
    BYD: ['text-byd', 'bg-byd'],
    ETR: ['text-etr', 'bg-etr'],
    INS: ['text-ins', 'bg-ins'],
};
