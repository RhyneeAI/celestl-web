<?php

namespace App\Http\Controllers\Admin;

use App\Difficulty;
use App\Http\Controllers\Controller;
use App\Models\Pack;
use App\Models\Song;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminSongController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $songs = Song::query()
            ->with(['pack', 'charts' => fn ($q) => $q->orderByRaw(
                "field(difficulty, '".implode("','", array_column(Difficulty::cases(), 'value'))."')"
            )])
            ->get()
            ->map(fn (Song $song) => [
                'id' => $song->id,
                'slug' => $song->slug,
                'title' => $song->title,
                'artist' => $song->artist,
                'pack' => $song->pack?->name,
                'side' => $song->side,
                'bpm' => $song->bpm,
                'length' => $song->length,
                'version' => $song->version,
                'released_at' => $song->released_at?->toDateString(),
                'diffs' => $song->charts->map(fn ($chart) => [
                    'difficulty' => $chart->difficulty->value,
                    'level' => $chart->level,
                    'constant' => $chart->constant,
                    'chart_designer' => $chart->chart_designer,
                    'jacket_designer' => $chart->jacket_designer,
                    'note_count' => $chart->note_count,
                ]),
            ]);

        // Grouped the same way the Packs page groups them, for the Pack <select> in "Add song".
        $packsBySection = Pack::query()
            ->withCount('songs')
            ->with('parent')
            ->get()
            ->groupBy(fn (Pack $p) => $p->section ?? ($p->parent?->section ?? 'Other'))
            ->map(fn ($packs) => $packs->sortBy('name')->values()->map(fn (Pack $p) => [
                'name' => $p->name,
                'is_child' => $p->parent_id !== null,
            ]));

        $packOptions = collect(Pack::SECTION_ORDER)
            ->map(fn (string $label) => [
                'label' => $label,
                'packs' => $packsBySection[$label] ?? collect(),
            ])
            ->filter(fn (array $s) => $s['packs']->isNotEmpty())
            ->values();

        return Inertia::render('admin/songs', [
            'songs' => $songs,
            'packOptions' => $packOptions,
            'initialPackFilter' => $request->query('pack'),
        ]);
    }
}
