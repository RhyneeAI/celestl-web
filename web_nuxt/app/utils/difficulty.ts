export const DIFFICULTY_ORDER = [
    'PST',
    'PRS',
    'FTR',
    'BYD',
    'ETR',
    'INS',
] as const;

export type DifficultyCode = (typeof DIFFICULTY_ORDER)[number];

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
