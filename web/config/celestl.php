<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Arcaea data path
    |--------------------------------------------------------------------------
    |
    | Local-only, gitignored folder of official/community Arcaea data
    | (songlist.json, packlist.json, chartconstant.json, etc.) that
    | celestl:import-arcaea-content reads from. Lives one level above this
    | Laravel app's root (see CLAUDE.md § Data dan hak cipta) — never
    | committed, never distributed from this repo.
    |
    */

    'arcaea_data_path' => env('ARCAEA_DATA_PATH', base_path('../data')),

];
