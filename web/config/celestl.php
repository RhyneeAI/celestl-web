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

    /*
    |--------------------------------------------------------------------------
    | Private server ("Unofficial" segment)
    |--------------------------------------------------------------------------
    |
    | Used by App\Services\PrivateServerPusher. `api_token` is the server's own static
    | `API_TOKEN` config value (ArcaeaServerFork/config.py) -- it acts as a system-role token, so
    | Celestl never needs the admin account password. `songs_path` is the server's
    | database/songs folder on the same machine (the server has no REST endpoint for .aff files).
    |
    */

    'private_server' => [
        'url' => env('ARCAEA_PRIVATE_SERVER_URL', 'http://127.0.0.1:8765'),
        'api_token' => env('ARCAEA_PRIVATE_SERVER_API_TOKEN'),
        'songs_path' => env(
            'ARCAEA_PRIVATE_SERVER_SONGS_PATH',
            base_path('../ArcaeaServerFork/database/songs'),
        ),
    ],

];
