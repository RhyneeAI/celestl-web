<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pack;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminPackController extends Controller
{
    // Display order for the section ribbons, mirrors the mockup's SECTION_ORDER (which itself
    // mirrors arcaea.miraheze.org/wiki/Pack_list's layout, not its color theme -- see CLAUDE.md).
    private const SECTION_ORDER = [
        'Arcaea', 'Main Story · Act I', 'Main Story · Act II', 'Side Story',
        'Collaboration', 'Variety', 'Other',
    ];

    public function __invoke(Request $request): Response
    {
        $packs = Pack::query()
            ->withCount('songs')
            ->with(['children' => fn ($q) => $q->orderBy('name')])
            ->get();

        $topLevel = $packs->whereNull('parent_id')->where('songs_count', '>', 0);

        $sections = collect(self::SECTION_ORDER)
            ->map(fn (string $label) => [
                'label' => $label,
                'packs' => $topLevel->where('section', $label)->values()->map(fn (Pack $p) => [
                    'id' => $p->id,
                    'slug' => $p->slug,
                    'name' => $p->name,
                    'song_count' => $p->songs_count,
                    'children' => $p->children->map(fn (Pack $c) => [
                        'id' => $c->id,
                        'slug' => $c->slug,
                        'name' => $c->name,
                    ]),
                ]),
            ])
            ->filter(fn (array $section) => $section['packs']->isNotEmpty())
            ->values();

        return Inertia::render('admin/packs', [
            'sections' => $sections,
            'totalPacks' => $packs->count(),
            'sectionOrder' => self::SECTION_ORDER,
            'topLevelPacks' => $topLevel->sortBy('name')->values()->map(fn (Pack $p) => [
                'id' => $p->id,
                'name' => $p->name,
            ]),
        ]);
    }
}
