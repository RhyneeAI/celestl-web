<?php

namespace App\Http\Controllers;

use App\Models\Play;
use App\Models\User;
use App\Services\ArcaeaRating;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The account's own page.
 *
 * Shows only what Celestl actually holds. The mockup also sketched a clear-type breakdown and a
 * chart across uploads, both read from Best 50 images -- that data arrives in Fase 3, so those
 * sections are absent rather than faked, the same way the in-game Potential is left out because
 * its formula is still unverified (CLAUDE.md § Potential total).
 */
class ProfileController extends Controller
{
    /** Arcaea ranks on the 50 best unique charts (CLAUDE.md § Aturan rating Arcaea). */
    private const TOP_N = 50;

    public function __construct(private readonly ArcaeaRating $rating) {}

    public function __invoke(): Response
    {
        /** @var User $user */
        $user = Auth::user();
        $user->load('gameIdentities.game');

        $identity = $user->identityFor('arcaea');
        $best = $this->bestPerChart($user);

        return Inertia::render('account/profile', [
            'identity' => $identity === null ? null : [
                'nickname' => $identity->display_name,
                'player_id' => $identity->formattedIdentifier(),
            ],
            'member_since' => $user->created_at?->toDateString(),
            'stats' => [
                'plays' => $user->plays()->count(),
                'charts' => $best->count(),
                'top_average' => $this->topAverage($best),
                'top_counted' => min($best->count(), self::TOP_N),
                'best' => $best->first(),
            ],
        ]);
    }

    /**
     * The best rated play on each distinct chart, highest first.
     *
     * Per chart, not per play: Arcaea ranks a chart once, by your best result on it, so ten
     * attempts at one song must not crowd out nine other songs.
     *
     * @return Collection<int, array<string, mixed>>
     */
    private function bestPerChart(User $user): Collection
    {
        return $user->plays()
            ->with('chart.song:id,slug,title')
            ->get()
            // A chart with no community constant cannot be rated, and a guessed number would make
            // a confident, wrong ranking.
            ->filter(fn (Play $play) => $play->chart->constant !== null)
            ->map(fn (Play $play) => [
                'slug' => $play->chart->song->slug,
                'title' => $play->chart->song->title,
                'difficulty' => $play->chart->difficulty->value,
                'score' => $play->score,
                'rating' => round(
                    $this->rating->playRating((float) $play->chart->constant, $play->score, $play->lamp),
                    6,
                ),
                'chart_id' => $play->chart_id,
            ])
            ->groupBy('chart_id')
            ->map(fn (Collection $plays) => $plays->sortByDesc('rating')->first())
            ->sortByDesc('rating')
            ->values();
    }

    /**
     * Mean rating of the top 50 charts, or of however many exist below that.
     *
     * Deliberately NOT labelled Potential. The in-game number is fed by something beyond these 50
     * plays -- 12.668 printed against a 12.640 average on the owner's own account -- so calling
     * this Potential would be wrong (CLAUDE.md § Potential total).
     *
     * @param  Collection<int, array<string, mixed>>  $best
     */
    private function topAverage(Collection $best): ?float
    {
        if ($best->isEmpty()) {
            return null;
        }

        return round($best->take(self::TOP_N)->avg('rating'), 4);
    }
}
