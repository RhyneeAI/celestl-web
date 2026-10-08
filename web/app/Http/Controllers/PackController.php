<?php

namespace App\Http\Controllers;

use App\Models\Pack;
use App\Models\Song;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Public pack browser (Task 1.4). The admin equivalent lives in Admin\AdminPackController; this one
 * only shows what a player needs, and only packs that actually have songs.
 */
class PackController extends Controller
{
    public function index(): Response
    {
        $packs = Pack::query()
            ->withCount('songs')
            ->with('parent:id,section')
            ->orderBy('name')
            ->get();

        $sections = collect(Pack::SECTION_ORDER)
            ->map(fn (string $label) => [
                'label' => $label,
                'packs' => $packs
                    // A chapter/append pack has no section of its own; it belongs with its parent.
                    ->filter(fn (Pack $pack) => ($pack->section ?? $pack->parent?->section ?? 'Other') === $label)
                    ->filter(fn (Pack $pack) => $pack->songs_count > 0)
                    ->values()
                    ->map(fn (Pack $pack) => [
                        'slug' => $pack->slug,
                        'name' => $pack->name,
                        'song_count' => $pack->songs_count,
                    ]),
            ])
            ->filter(fn (array $section) => $section['packs']->isNotEmpty())
            ->values();

        return Inertia::render('packs/index', [
            'sections' => $sections,
        ]);
    }

    public function show(string $slug): Response
    {
        $pack = Pack::query()
            ->with('parent:id,slug,name,section')
            ->where('slug', $slug)
            ->firstOrFail();

        $songs = Song::query()
            ->where('pack_id', $pack->id)
            ->orderBy('title')
            ->get(['slug', 'title', 'artist'])
            ->map(fn (Song $song) => [
                'slug' => $song->slug,
                'title' => $song->title,
                'artist' => $song->artist,
            ]);

        return Inertia::render('packs/show', [
            'pack' => [
                'slug' => $pack->slug,
                'name' => $pack->name,
                'section' => $pack->section ?? $pack->parent?->section,
            ],
            'songs' => $songs,
        ]);
    }
}
