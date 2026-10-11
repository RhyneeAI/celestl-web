<?php

namespace App\Http\Controllers;

use App\Difficulty;
use App\Models\Chart;
use App\Models\Play;
use App\Models\Song;
use App\Services\ArcaeaRating;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Play rating calculator (Task 2.2).
 *
 * The catalogue ships with the page because the rating is recomputed on every keystroke, which
 * rules out a round trip per character.
 *
 * History is the one part that depends on who is asking: signed in, it lives in `plays` here;
 * signed out, in the player's own browser (the owner's decision -- CLAUDE.md § Kalkulator).
 */
class CalculatorController extends Controller
{
    public function __construct(private readonly ArcaeaRating $rating) {}

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
            'history' => Auth::check() ? $this->history() : null,
        ]);
    }

    /**
     * The signed-in account's logged plays, newest first.
     *
     * The rating is computed here rather than stored (see the plays migration): it is a pure
     * function of the constant, the score and the lamp, and constants get revised.
     *
     * @return list<array<string, mixed>>
     */
    private function history(): array
    {
        return Play::query()
            ->where('user_id', Auth::id())
            ->with('chart.song:id,slug,title')
            ->latest('played_at')
            ->limit(200)
            ->get()
            ->map(fn (Play $play) => [
                'id' => $play->id,
                'slug' => $play->chart->song->slug,
                'title' => $play->chart->song->title,
                'difficulty' => $play->chart->difficulty->value,
                'score' => $play->score,
                'lamp' => $play->lamp->value,
                'rating' => $play->chart->constant === null
                    ? null
                    : round($this->rating->playRating((float) $play->chart->constant, $play->score, $play->lamp), 6),
                'playedAt' => $play->played_at->toIso8601String(),
            ])
            ->all();
    }
}
