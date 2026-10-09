<?php

namespace App\Http\Controllers;

use App\Difficulty;
use App\Models\Chart;
use App\Models\Song;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Play rating calculator (Task 2.2).
 *
 * Everything the page needs ships with it: the rating is recomputed on every keystroke, so a round
 * trip per character is out, and a signed-out player's history lives in their own browser (the
 * owner's decision -- see CLAUDE.md § Kalkulator). That leaves this controller with one job,
 * handing over the catalogue.
 */
class CalculatorController extends Controller
{
    public function __invoke(): Response
    {
        $order = array_column(Difficulty::cases(), 'value');

        $songs = Song::query()
            ->with(['charts:id,song_id,difficulty,level,constant'])
            ->orderBy('title')
            ->get(['id', 'slug', 'title', 'artist', 'jacket_thumb_path'])
            ->map(fn (Song $song) => [
                'slug' => $song->slug,
                'title' => $song->title,
                'artist' => $song->artist,
                'jacket' => $song->jacketUrl(thumb: true),
                'charts' => $song->charts
                    ->sortBy(fn (Chart $chart) => array_search($chart->difficulty->value, $order, true))
                    ->values()
                    ->map(fn (Chart $chart) => [
                        'difficulty' => $chart->difficulty->value,
                        'level' => $chart->level,
                        // Null for the handful of charts the wiki has not rated. The page has to
                        // handle that rather than guess a constant -- a made-up number would
                        // produce a confident, wrong rating.
                        'constant' => $chart->constant === null ? null : (float) $chart->constant,
                    ]),
            ]);

        return Inertia::render('calculator', [
            'songs' => $songs,
        ]);
    }
}
