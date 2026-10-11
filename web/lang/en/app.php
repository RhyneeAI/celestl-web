<?php

/*
 * UI strings for the public (player-facing) pages. English is the primary language; JA/KO/ZH follow
 * the in-game languages later (CLAUDE.md § Stack). Never hardcode UI text in the React pages —
 * add it here and read it with t() from resources/js/lib/i18n.ts.
 */

return [
    'brand' => 'Celestl',
    'version' => 'ver 1.xx',

    'nav' => [
        'songs' => 'Songs',
        'packs' => 'Packs',
        'calculator' => 'Calculator',
        'back' => 'Back',
    ],

    'songs' => [
        'title' => 'Songs',
        'search_placeholder' => 'Search a song, artist, or pack…',
        'count' => ':shown of :total songs',
        'empty_title' => 'No songs found',
        'empty_body' => 'Try a different title, artist, or pack name.',
        'unknown_artist' => 'Unknown artist',
        'no_pack' => 'No pack',
    ],

    'song' => [
        'difficulty' => 'Difficulty',
        'bpm' => 'BPM',
        'length' => 'Length',
        'side' => 'Side',
        'version' => 'Version',
        'released' => 'Released',
        'pack' => 'Pack',
        'charts' => 'Charts',
        'level' => 'Level',
        'constant' => 'Constant',
        'notes' => 'Notes',
        'chart_design' => 'Chart design',
        'jacket_design' => 'Jacket design',
        'uncredited' => 'Uncredited',
        'unknown' => 'Unknown',
        'no_charts' => 'No chart data for this song yet.',
    ],

    'calculator' => [
        'title' => 'Rating calculator',
        'pick_song' => 'Pick a song',
        'search_placeholder' => 'Search a song or artist…',
        'change_song' => 'Change',
        'difficulty' => 'Difficulty',
        'score' => 'Score',
        'lamp' => 'Lamp',
        'constant' => 'Chart constant',
        'grade' => 'Grade',
        'potential' => 'Potential',
        'no_constant' => 'No chart constant on record for this difficulty, so its rating cannot be calculated. The community wiki has not rated it yet.',
        'empty' => 'Pick a song to start.',
        'save' => 'Save to history',
        'saved' => 'Saved',
        'history' => 'History',
        'history_empty' => 'Nothing saved yet.',
        'history_local' => 'Saved in this browser only. Nothing is sent to the server, and clearing your browser data clears this.',
        'history_account' => 'Saved to your account.',
        'import_local' => 'Import :count saved in this browser',
        'imported' => ':count imported',
        'history_clear' => 'Clear history',
        'remove' => 'Remove',
        'drop_image' => 'Drop Image',
        'drop_image_note' => 'Reading a Best 50 image is not built yet (Fase 3). Enter the score by hand for now.',
        'lamps' => [
            'lost' => 'Lost',
            'easy_clear' => 'Easy Clear',
            'normal_clear' => 'Normal Clear',
            'hard_clear' => 'Hard Clear',
            'full_recall' => 'Full Recall',
            'pure_memory' => 'Pure Memory',
        ],
    ],

    'account' => [
        'sign_in' => 'Sign in',
        'sign_out' => 'Sign out',
        'register' => 'Create account',
        'guest' => 'Continue as guest',
        'identity' => 'Player ID or nickname',
        'identity_placeholder' => '000 000 000',
        'player_id' => 'Player ID',
        'nickname' => 'Nickname',
        'nickname_placeholder' => 'AnisphiaaaUwU',
        'player_id_hint' => '9 digits, from your Arcaea account page.',
        'nickname_hint' => 'Shown on your profile. You can change it later, just like in game.',
        'no_account' => 'No account yet?',
        'have_account' => 'Already have an account?',
        'heads_up' => 'Heads up',
        'no_password_warning' => 'Celestl has no passwords. Your Player ID and nickname both appear on any Best 50 image you share, so anyone who has seen one can open your history.',
        'profile' => 'Profile',
        'member_since' => 'Member since',
        'top_average' => 'Top :count average',
        'plays_logged' => 'Plays logged',
        'charts_played' => 'Charts played',
        'best_play' => 'Best play',
        'no_plays' => 'Nothing logged yet. Work out a rating in the calculator and save it.',
        'why_no_potential' => 'Why no Potential?',
        'why_no_potential_body' => 'Arcaea feeds its Potential from something beyond these plays, so Celestl will not print one until that rule is confirmed. The average above is exactly what it says: the mean of your best rated charts.',
        'from_best_50' => 'Clear breakdown and progress over time are read from Best 50 images, which Celestl cannot read yet.',
    ],

    'packs' => [
        'title' => 'Packs',
        'count' => ':count packs',
        'song_count' => ':count songs',
        'song_count_one' => '1 song',
    ],
];
