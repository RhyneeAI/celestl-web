<?php

namespace App\Http\Controllers\Admin;

use App\Difficulty;
use App\Http\Controllers\Controller;
use App\Models\Chart;
use App\Models\Pack;
use App\Models\Song;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminHomeController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): Response
    {
        $difficultyCounts = Chart::query()
            ->selectRaw('difficulty, count(*) as count')
            ->groupBy('difficulty')
            ->pluck('count', 'difficulty');

        $diffBreakdown = collect(Difficulty::cases())->map(fn (Difficulty $d) => [
            'difficulty' => $d->value,
            'count' => (int) ($difficultyCounts[$d->value] ?? 0),
        ]);

        $recent = Song::query()
            ->whereNotNull('released_at')
            ->with(['pack', 'charts'])
            ->orderByDesc('released_at')
            ->limit(20)
            ->get()
            ->map(function (Song $song) {
                $topChart = collect(Difficulty::cases())
                    ->reverse()
                    ->map(fn (Difficulty $d) => $song->charts->firstWhere('difficulty', $d))
                    ->first(fn ($chart) => $chart !== null);

                return [
                    'slug' => $song->slug,
                    'title' => $song->title,
                    'jacket' => $song->jacketUrl(thumb: true),
                    'pack' => $song->pack?->name,
                    'released_at' => $song->released_at?->toDateString(),
                    'top_difficulty' => $topChart?->difficulty->value,
                    'top_level' => $topChart?->level,
                ];
            });

        return Inertia::render('admin/home', [
            'stats' => [
                'totalCharts' => Chart::count(),
                'totalSongs' => Song::count(),
                'totalPacks' => Pack::count(),
                'diffBreakdown' => $diffBreakdown,
            ],
            'recent' => $recent,
        ]);
    }
}
