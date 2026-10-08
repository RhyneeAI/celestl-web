<?php

namespace App\Http\Controllers;

use App\Difficulty;
use App\Models\Chart;
use App\Models\Song;
use Illuminate\Support\Collection;
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

        $charts = $song->charts
            // Enum case order (PST..INS), not insertion order, so the table reads in the
            // same order the game shows difficulties.
            ->sortBy(fn (Chart $chart) => array_search($chart->difficulty, Difficulty::cases(), true))
            ->values();

        return Inertia::render('songs/show', [
            'song' => [
                'slug' => $song->slug,
                'title' => $song->title,
                'artist' => $song->artist,
                'jackets' => $this->jackets($song, $charts),
                'bpm' => $song->bpm,
                'length' => $song->length,
                'side' => $song->side,
                'version' => $song->version,
                'released_at' => $song->released_at?->toDateString(),
                'pack' => $song->pack ? ['slug' => $song->pack->slug, 'name' => $song->pack->name] : null,
                'charts' => $charts
                    ->map(fn (Chart $chart) => [
                        'difficulty' => $chart->difficulty->value,
                        'level' => $chart->level,
                        'constant' => $chart->constant,
                        'note_count' => $chart->note_count,
                        'chart_designer' => $chart->chart_designer,
                        'jacket_designer' => $chart->jacket_designer,
                    ]),
            ],
        ]);
    }

    /**
     * The distinct jackets this song has, lowest difficulty first.
     *
     * Most songs have exactly one, so the page shows no switch. 50 songs have a second: a
     * difficulty that sets `jacketOverride` in songlist.json gets its own artwork (Beyond for most
     * of them; Past+Present together for a handful such as Prism and To the Furthest Dream).
     *
     * Runs of difficulties that share an image collapse into one entry labelled with all of them,
     * the same rule the community wiki's Module:SongData uses. A chart whose override file is not
     * present on this install falls back to the song's jacket and therefore collapses too, so the
     * switch only ever appears when there really is a second image to switch to.
     *
     * @param  Collection<int, Chart>  $charts
     * @return list<array{url: string|null, label: string}>
     */
    private function jackets(Song $song, Collection $charts): array
    {
        $base = $song->jacketUrl();
        $jackets = [];

        foreach ($charts as $chart) {
            $url = $chart->jacketUrl() ?? $base;
            $last = count($jackets) - 1;

            if ($last >= 0 && $jackets[$last]['url'] === $url) {
                $jackets[$last]['label'] .= ' / '.$chart->difficulty->value;

                continue;
            }

            $jackets[] = ['url' => $url, 'label' => $chart->difficulty->value];
        }

        // A song with no charts at all still has its own jacket to show.
        return $jackets ?: [['url' => $base, 'label' => '']];
    }
}
