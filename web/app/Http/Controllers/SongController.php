<?php

namespace App\Http\Controllers;

use App\Difficulty;
use App\Models\Song;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Public song catalogue (Task 1.4). Admin has its own controllers under Admin\ — this one is for
 * the player-facing pages and never exposes admin-only fields.
 */
class SongController extends Controller
{
    public function index(): Response
    {
        // The whole catalogue is sent once and filtered in the browser: ~563 rows of 5 short fields
        // is small, and it keeps search instant while typing (no round-trip per keystroke).
        // Charts are deliberately left out here — only the detail page needs them.
        $songs = Song::query()
            ->with('pack:id,name')
            ->orderBy('title')
            ->get(['id', 'slug', 'title', 'artist', 'pack_id', 'jacket_thumb_path'])
            ->map(fn (Song $song) => [
                'slug' => $song->slug,
                'title' => $song->title,
                'artist' => $song->artist,
                'pack' => $song->pack?->name,
                'jacket' => $song->jacketUrl(thumb: true),
            ]);

        return Inertia::render('songs/index', [
            'songs' => $songs,
        ]);
    }

    public function show(string $slug): Response
    {
        $song = Song::query()
            ->with(['pack:id,slug,name', 'charts'])
            ->where('slug', $slug)
            ->firstOrFail();

        return Inertia::render('songs/show', [
            'song' => [
                'slug' => $song->slug,
                'title' => $song->title,
                'artist' => $song->artist,
                'jacket' => $song->jacketUrl(),
                'bpm' => $song->bpm,
                'length' => $song->length,
                'side' => $song->side,
                'version' => $song->version,
                'released_at' => $song->released_at?->toDateString(),
                'pack' => $song->pack ? ['slug' => $song->pack->slug, 'name' => $song->pack->name] : null,
                'charts' => $song->charts
                    // Enum case order (PST..INS), not insertion order, so the table reads in the
                    // same order the game shows difficulties.
                    ->sortBy(fn ($chart) => array_search($chart->difficulty, Difficulty::cases(), true))
                    ->values()
                    ->map(fn ($chart) => [
                        'difficulty' => $chart->difficulty->value,
                        'level' => $chart->level,
                        'constant' => $chart->constant,
                        'note_count' => $chart->note_count,
                        'chart_designer' => $chart->chart_designer,
                    ]),
            ],
        ]);
    }
}
