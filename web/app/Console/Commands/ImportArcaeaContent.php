<?php

namespace App\Console\Commands;

use App\Difficulty;
use App\Models\Chart;
use App\Models\Game;
use App\Models\Pack;
use App\Models\Song;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\File;

#[Signature('celestl:import-arcaea-content')]
#[Description('Import Arcaea packs/songs/charts from the local data/*.json sources into the database')]
class ImportArcaeaContent extends Command
{
    /**
     * Raw packlist.json `section` codes -> the display categories already
     * finalized for the admin mockup (CLAUDE.md § Mockup buatan sendiri).
     * Anything not in this map (and the synthetic packs below) falls back to "Other".
     */
    private const SECTION_LABELS = [
        'arcaea' => 'Arcaea',
        'mainstory' => 'Main Story · Act I',
        'mainstory2' => 'Main Story · Act II',
        'sidestory' => 'Side Story',
        'collab' => 'Collaboration',
        'variety' => 'Variety',
    ];

    /**
     * Raw songlist.json `side` index -> display name (CLAUDE.md § Field side).
     */
    private const SIDE_LABELS = [
        0 => 'Light',
        1 => 'Conflict',
        2 => 'Colorless',
        3 => 'Lephon',
        4 => 'Catastrophe',
    ];

    private int $packsNew = 0;

    private int $packsUpdated = 0;

    private int $songsNew = 0;

    private int $songsUpdated = 0;

    private int $songsSkippedDeleted = 0;

    private int $chartsNew = 0;

    private int $chartsUpdated = 0;

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $dataPath = config('celestl.arcaea_data_path');

        if (! File::isDirectory($dataPath)) {
            $this->error("Data directory not found: {$dataPath}");
            $this->line('Set ARCAEA_DATA_PATH in .env, or place the data/ folder one level above web/.');

            return self::FAILURE;
        }

        $game = Game::query()->updateOrCreate(['slug' => 'arcaea'], ['name' => 'Arcaea']);

        $packlist = $this->readJson($dataPath, 'packlist.json')['packs'];
        $songlist = $this->readJson($dataPath, 'songlist.json')['songs'];
        $chartconstant = $this->readJson($dataPath, 'chartconstant.json');
        $notecount = $this->readJson($dataPath, 'notecount.json')['notes'] ?? [];
        $songlength = $this->readJson($dataPath, 'songlength.json');
        $others = $this->readJson($dataPath, 'songlistothers.json');

        $packIdsBySlug = $this->importPacks($game, $packlist);

        foreach ($songlist as $song) {
            // songlist.json itself contains stub entries for removed songs (e.g. `{"idx":127,
            // "id":"particlearts","deleted":true}`, no `difficulties` at all) alongside the full
            // historical record in songlistothers.json's `deleted` — never import either one, a
            // score-tracker has no use for charts nobody can play anymore (CLAUDE.md § songlistothers.json).
            if (($song['deleted'] ?? false) || ! isset($song['difficulties'])) {
                $this->songsSkippedDeleted++;

                continue;
            }

            $this->importSong($game, $song, $packIdsBySlug, $chartconstant, $notecount, $songlength);
        }

        $this->songsSkippedDeleted += count($others['deleted'] ?? []);

        $this->importSpecialSongs($game, $others['special'] ?? [], $packIdsBySlug, $chartconstant, $notecount);

        $this->table(
            ['Entity', 'New', 'Updated', 'Skipped'],
            [
                ['Packs', $this->packsNew, $this->packsUpdated, '—'],
                ['Songs', $this->songsNew, $this->songsUpdated, $this->songsSkippedDeleted.' (deleted)'],
                ['Charts', $this->chartsNew, $this->chartsUpdated, '—'],
            ]
        );

        return self::SUCCESS;
    }

    /**
     * @return array<string, int> pack slug => id, including the synthetic "aprilfools" bucket
     */
    private function importPacks(Game $game, array $packlist): array
    {
        $slugToId = [];

        // Pass 1: create/update every real pack without parent_id (parents may not exist yet).
        foreach ($packlist as $raw) {
            [$pack, $wasRecentlyCreated] = $this->upsertPack($game, [
                'slug' => $raw['id'],
                'name' => $raw['name_localized']['en'] ?? $raw['id'],
                'section' => self::SECTION_LABELS[$raw['section'] ?? ''] ?? 'Other',
                'small_pack_image' => $raw['small_pack_image'] ?? false,
            ]);

            $slugToId[$raw['id']] = $pack->id;
            $wasRecentlyCreated ? $this->packsNew++ : $this->packsUpdated++;
        }

        // Pass 2: now that every pack row exists, wire up parent_id from pack_parent.
        foreach ($packlist as $raw) {
            if (! isset($raw['pack_parent'])) {
                continue;
            }

            $parentId = $slugToId[$raw['pack_parent']] ?? null;
            if ($parentId === null) {
                $this->warn("Pack '{$raw['id']}' references unknown pack_parent '{$raw['pack_parent']}', leaving it top-level.");

                continue;
            }

            Pack::query()->where('id', $slugToId[$raw['id']])->update(['parent_id' => $parentId]);
        }

        // Synthetic pack for the 10 songlistothers.json `special` entries, which don't belong to any
        // real pack (CLAUDE.md § songlistothers.json). Not a real packlist.json entry.
        [$aprilfools, $wasRecentlyCreated] = $this->upsertPack($game, [
            'slug' => 'aprilfools',
            'name' => 'April Fools',
            'section' => 'Other',
            'small_pack_image' => false,
        ]);
        $slugToId['aprilfools'] = $aprilfools->id;
        $wasRecentlyCreated ? $this->packsNew++ : $this->packsUpdated++;

        return $slugToId;
    }

    /**
     * @return array{0: Pack, 1: bool}
     */
    private function upsertPack(Game $game, array $attributes): array
    {
        $pack = Pack::query()->where('game_id', $game->id)->where('slug', $attributes['slug'])->first();
        $wasRecentlyCreated = $pack === null;

        $pack = Pack::query()->updateOrCreate(
            ['game_id' => $game->id, 'slug' => $attributes['slug']],
            $attributes
        );

        return [$pack, $wasRecentlyCreated];
    }

    private function importSong(
        Game $game,
        array $raw,
        array $packIdsBySlug,
        array $chartconstant,
        array $notecount,
        array $songlength,
    ): void {
        // "single" is a real, common `set` value (135 songs) for standalone single releases that
        // were never sold as part of a pack — not a data problem, just means pack_id stays null.
        $packId = $packIdsBySlug[$raw['set']] ?? null;
        if ($packId === null && $raw['set'] !== 'single') {
            $this->warn("Song '{$raw['id']}' references unknown pack '{$raw['set']}', leaving pack_id null.");
        }

        $song = Song::query()->where('game_id', $game->id)->where('slug', $raw['id'])->first();
        $wasRecentlyCreated = $song === null;

        $song = Song::query()->updateOrCreate(
            ['game_id' => $game->id, 'slug' => $raw['id']],
            [
                'pack_id' => $packId,
                'title' => $raw['title_localized']['en'] ?? $raw['id'],
                'title_localized' => $raw['title_localized'] ?? null,
                'artist' => $raw['artist'] ?? null,
                'side' => self::SIDE_LABELS[$raw['side'] ?? -1] ?? null,
                'bpm' => $raw['bpm'] ?? null,
                'length' => $songlength[$raw['id']] ?? null,
                'version' => $raw['version'] ?? null,
                'released_at' => isset($raw['date']) ? Carbon::createFromTimestamp($raw['date'])->toDateString() : null,
            ]
        );
        $wasRecentlyCreated ? $this->songsNew++ : $this->songsUpdated++;

        $constants = $chartconstant[$raw['id']] ?? [];
        $notes = $notecount[$raw['id']] ?? [];

        foreach ($raw['difficulties'] as $diff) {
            $this->importChart($song, $diff, $constants, $notes, $song->version);
        }
    }

    /**
     * songlistothers.json's `special` array: 9 genuine April Fools joke songs (`set: "aprilfools"`,
     * `rating: "?"`) plus 1 unrelated `tutorial` song (`set: "tutorial"`, normal numeric ratings).
     * Neither `aprilfools` nor `tutorial` is a real pack in packlist.json — both get bucketed into
     * the synthetic "aprilfools" pack here. That's a judgment call for `tutorial` specifically
     * (it isn't actually an April Fools joke), flagged in CLAUDE.md, not a confirmed decision.
     */
    private function importSpecialSongs(Game $game, array $specials, array $packIdsBySlug, array $chartconstant, array $notecount): void
    {
        $aprilfoolsPackId = $packIdsBySlug['aprilfools'];

        foreach ($specials as $raw) {
            $song = Song::query()->where('game_id', $game->id)->where('slug', $raw['id'])->first();
            $wasRecentlyCreated = $song === null;

            $song = Song::query()->updateOrCreate(
                ['game_id' => $game->id, 'slug' => $raw['id']],
                [
                    'pack_id' => $aprilfoolsPackId,
                    'title' => $raw['title_localized']['en'] ?? $raw['id'],
                    'title_localized' => $raw['title_localized'] ?? null,
                    'artist' => $raw['artist'] ?? null,
                    'side' => self::SIDE_LABELS[$raw['side'] ?? -1] ?? null,
                    'bpm' => $raw['bpm'] ?? null,
                    'length' => null,
                    'version' => $raw['version'] ?? null,
                    'released_at' => isset($raw['date']) ? Carbon::createFromTimestamp($raw['date'])->toDateString() : null,
                ]
            );
            $wasRecentlyCreated ? $this->songsNew++ : $this->songsUpdated++;

            $constants = $chartconstant[$raw['id']] ?? [];
            $notes = $notecount[$raw['id']] ?? [];

            foreach ($raw['difficulties'] as $diff) {
                // Special entries sometimes carry note count inline (`difficulties[].notes`) instead
                // of in notecount.json — importChart() prefers the inline value when present.
                $this->importChart($song, $diff, $constants, $notes, $song->version);
            }
        }
    }

    private function importChart(Song $song, array $diff, array $constants, array $notes, ?string $gameVersion): void
    {
        $difficulty = Difficulty::fromRatingClass($diff['ratingClass'], $diff['ratingClassAlias'] ?? null);

        // `rating` is an int (6) in the main catalog but a literal string ("?") for April Fools
        // songs — cast to string either way, never parse it as a number (CLAUDE.md § songlistothers.json).
        $level = (string) $diff['rating'];
        if (! empty($diff['ratingPlus'])) {
            $level .= '+';
        }

        $constantEntry = $constants[$diff['ratingClass']] ?? null;
        $noteCount = $diff['notes'] ?? $notes[$diff['ratingClass']] ?? null;

        $chart = Chart::query()->where('song_id', $song->id)->where('difficulty', $difficulty->value)->first();
        $wasRecentlyCreated = $chart === null;

        Chart::query()->updateOrCreate(
            ['song_id' => $song->id, 'difficulty' => $difficulty->value],
            [
                'level' => $level,
                'constant' => $constantEntry['constant'] ?? null,
                'chart_designer' => $diff['chartDesigner'] ?? null,
                'jacket_designer' => $diff['jacketDesigner'] ?? null,
                'note_count' => $noteCount,
                // The data only has a per-song version, not per-difficulty — a BYD/ETR added later than
                // the song itself will be misattributed to the song's original version. Known limitation,
                // no per-difficulty source exists yet.
                'game_version' => $gameVersion,
                'source' => $constantEntry !== null ? 'arcaea.miraheze.org Data:ChartConstant.json' : null,
            ]
        );
        $wasRecentlyCreated ? $this->chartsNew++ : $this->chartsUpdated++;
    }

    private function readJson(string $dataPath, string $filename): array
    {
        $path = $dataPath.'/'.$filename;

        if (! File::exists($path)) {
            $this->warn("Missing {$filename}, skipping anything that depends on it.");

            return [];
        }

        return json_decode(File::get($path), associative: true, flags: JSON_THROW_ON_ERROR);
    }
}
