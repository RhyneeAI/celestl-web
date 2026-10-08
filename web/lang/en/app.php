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
        'uncredited' => 'Uncredited',
        'unknown' => 'Unknown',
        'no_charts' => 'No chart data for this song yet.',
    ],

    'packs' => [
        'title' => 'Packs',
        'count' => ':count packs',
        'song_count' => ':count songs',
        'song_count_one' => '1 song',
    ],
];
