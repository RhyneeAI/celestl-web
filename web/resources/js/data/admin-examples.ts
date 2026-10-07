// Static example data ported 1:1 from design/admin-dashboard.html's GAMES/USERS/LOG consts.
// Users, Game management, and Activity log stay on this fixture (not the database) until Fase 4/5.2
// build the real accounts system and activity tracking -- see CLAUDE.md § Port admin mockup.

export type GameEntry = {
    name: string;
    status: 'active' | 'hold';
    ids: [label: string, hint: string, example: string][];
};

export const GAMES: GameEntry[] = [
    {
        name: 'Arcaea',
        status: 'active',
        ids: [
            ['Player ID', '9-digit numeric, permanent', '160 500 737'],
            ['Nickname', 'mutable, display only', 'AnisphiaaaUwU'],
        ],
    },
    {
        name: 'Rotaeno',
        status: 'hold',
        ids: [['Identity schema', 'TBD — ditunda sesuai CLAUDE.md', '—']],
    },
];

export type UserEntry = [
    name: string,
    avatarLetter: string,
    game: string,
    identity: string,
    joined: string,
    lastActive: string,
    status: 'active' | 'warn',
];

export const USERS: UserEntry[] = [
    [
        'AnisphiaaaUwU',
        'A',
        'Arcaea',
        'Player ID 160 500 737',
        'Sep 2026',
        '2h ago',
        'active',
    ],
    [
        'Minji',
        'M',
        'Arcaea',
        'Player ID 204 118 906',
        'Sep 2026',
        '1d ago',
        'active',
    ],
    [
        'kurotsuki',
        'K',
        'Arcaea',
        'Player ID 311 907 442',
        'Sep 2026',
        '—',
        'warn',
    ],
    [
        'Rei.',
        'R',
        'Arcaea',
        'Player ID 158 330 271',
        'Aug 2026',
        '5h ago',
        'active',
    ],
];

export type LogType = 'upload' | 'import' | 'edit' | 'account';
export type LogState = 'ok' | 'warn' | 'bad';

export type LogEntry = [
    type: LogType,
    who: string,
    description: string,
    when: string,
    state: LogState,
];

export const LOG: LogEntry[] = [
    [
        'upload',
        'AnisphiaaaUwU',
        'uploaded a Best 50 image — 50/50 charts read',
        '18 Sep 2026',
        'ok',
    ],
    [
        'upload',
        'Minji',
        'uploaded a Best 50 image — nickname on image says “minji_”',
        '17 Sep 2026',
        'warn',
    ],
    [
        'upload',
        'kurotsuki',
        'uploaded a Best 50 image — only 17/50 cards read, image cropped',
        '17 Sep 2026',
        'bad',
    ],
    [
        'import',
        'AnisphiaaaUwU',
        'imported arcaea_v6_wiki.csv — 142 new, 58 updated, 3 failed',
        '16 Sep 2026',
        'warn',
    ],
    [
        'edit',
        'AnisphiaaaUwU',
        'edited chart constant for ALTER EGO [FTR] 10.4 → 10.5',
        '15 Sep 2026',
        'ok',
    ],
    ['account', '—', 'Rei. created an account', '12 Sep 2026', 'ok'],
];

// Used by the full Activity log page's type chip (type -> color), ported from TYPE_COL.
export const TYPE_COLOR: Record<LogType, string> = {
    upload: 'bg-pst',
    import: 'bg-ftr',
    edit: 'bg-prs',
    account: 'bg-neutral',
};

export const TYPE_LABEL: Record<LogType, string> = {
    upload: 'Best 50',
    import: 'CSV import',
    edit: 'Admin edit',
    account: 'Account',
};

/**
 * Home page's "Recent activity" feed dot uses a DIFFERENT rule than the full Activity log page's
 * type chip above -- edit is always prs, import is always ftr, but upload/account depend on state
 * (ok -> pst, otherwise -> warn). Ported exactly from the mockup's inline ternary, not a mistake.
 */
export function homeFeedDotColor(type: LogType, state: LogState): string {
    if (type === 'edit') return 'bg-prs';
    if (type === 'import') return 'bg-ftr';
    return state === 'ok' ? 'bg-pst' : 'bg-warn';
}
