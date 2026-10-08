<?php

use App\Models\Chart;
use App\Models\Game;
use App\Models\Pack;
use App\Models\Song;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;

uses(RefreshDatabase::class);

/**
 * Public song catalogue (Task 1.4). These pages are player-facing, so the assertions are about
 * what reaches the browser, not about internals.
 */
beforeEach(function () {
    $this->game = Game::factory()->create(['slug' => 'arcaea', 'name' => 'Arcaea']);
});

test('the landing page lists every song with its pack', function () {
    $pack = Pack::factory()->create(['game_id' => $this->game->id, 'name' => 'Divine Oblivion']);
    Song::factory()->create([
        'game_id' => $this->game->id,
        'pack_id' => $pack->id,
        'slug' => 'dreadarea',
        'title' => 'DREAD AREA',
        'artist' => 'Laur',
    ]);
    Song::factory()->create(['game_id' => $this->game->id, 'pack_id' => null, 'title' => 'Zzz']);

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('songs/index')
            ->has('songs', 2)
            // Alphabetical, so the packless "Zzz" lands last.
            ->where('songs.0.title', 'DREAD AREA')
            ->where('songs.0.pack', 'Divine Oblivion')
            ->where('songs.1.pack', null)
        );
});

test('a song detail page lists its charts in difficulty order, not insertion order', function () {
    $song = Song::factory()->create([
        'game_id' => $this->game->id,
        'slug' => 'extradimensional',
        'title' => 'Extradimensional Cosmic Phenomenon',
        'bpm' => '200',
    ]);

    // Deliberately inserted out of order.
    foreach (['ETR', 'PST', 'FTR'] as $difficulty) {
        Chart::factory()->create(['song_id' => $song->id, 'difficulty' => $difficulty]);
    }

    $this->get('/songs/extradimensional')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('songs/show')
            ->where('song.title', 'Extradimensional Cosmic Phenomenon')
            ->where('song.bpm', '200')
            ->has('song.charts', 3)
            ->where('song.charts.0.difficulty', 'PST')
            ->where('song.charts.1.difficulty', 'FTR')
            ->where('song.charts.2.difficulty', 'ETR')
        );
});

test('each chart carries its own designers, which can differ between difficulties', function () {
    // 17 real songs credit a different artist for their Beyond jacket, which is why jacketDesigner
    // is stored per chart and not per song -- see CLAUDE.md § Skema songs/charts/packs.
    $song = Song::factory()->create(['game_id' => $this->game->id, 'slug' => 'goodtek']);
    Chart::factory()->create([
        'song_id' => $song->id, 'difficulty' => 'FTR',
        'chart_designer' => 'Nitro', 'jacket_designer' => 'Koyama Mai',
    ]);
    Chart::factory()->create([
        'song_id' => $song->id, 'difficulty' => 'BYD',
        'chart_designer' => 'GOODTOAST', 'jacket_designer' => '出前',
    ]);

    $this->get('/songs/goodtek')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('song.charts.0.jacket_designer', 'Koyama Mai')
            ->where('song.charts.1.jacket_designer', '出前')
            ->where('song.charts.1.chart_designer', 'GOODTOAST')
        );
});

test('an unknown song slug 404s instead of rendering an empty page', function () {
    $this->get('/songs/does-not-exist')->assertNotFound();
});

test('the pack list groups packs by section and skips empty ones', function () {
    $withSongs = Pack::factory()->create([
        'game_id' => $this->game->id,
        'slug' => 'base',
        'name' => 'Arcaea',
        'section' => 'Arcaea',
    ]);
    Song::factory()->create(['game_id' => $this->game->id, 'pack_id' => $withSongs->id]);

    Pack::factory()->create([
        'game_id' => $this->game->id,
        'slug' => 'empty',
        'name' => 'Empty Pack',
        'section' => 'Variety',
    ]);

    $this->get('/packs')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('packs/index')
            ->has('sections', 1)
            ->where('sections.0.label', 'Arcaea')
            ->where('sections.0.packs.0.song_count', 1)
        );
});

test('a chapter pack is grouped under its parent section', function () {
    $parent = Pack::factory()->create([
        'game_id' => $this->game->id,
        'slug' => 'eden',
        'name' => 'Lasting Eden',
        'section' => 'Side Story',
    ]);
    $chapter = Pack::factory()->create([
        'game_id' => $this->game->id,
        'slug' => 'eden_append_1',
        'name' => 'Lasting Eden Chapter 2',
        'section' => null,
        'parent_id' => $parent->id,
    ]);
    Song::factory()->create(['game_id' => $this->game->id, 'pack_id' => $chapter->id]);

    $this->get('/packs')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('sections', 1)
            ->where('sections.0.label', 'Side Story')
            ->where('sections.0.packs.0.name', 'Lasting Eden Chapter 2')
        );

    $this->get('/packs/eden_append_1')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('packs/show')
            ->where('pack.section', 'Side Story')
            ->has('songs', 1)
        );
});

test('a pack page only lists its own songs', function () {
    $pack = Pack::factory()->create(['game_id' => $this->game->id, 'slug' => 'base', 'name' => 'Arcaea']);
    Song::factory()->create(['game_id' => $this->game->id, 'pack_id' => $pack->id, 'title' => 'Mine']);
    Song::factory()->create(['game_id' => $this->game->id, 'pack_id' => null, 'title' => 'Not mine']);

    $this->get('/packs/base')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('songs', 1)
            ->where('songs.0.title', 'Mine')
        );
});

test('a jacket URL is sent only when this install actually has the file', function () {
    Song::factory()->create([
        'game_id' => $this->game->id,
        'slug' => 'withart',
        'title' => 'With art',
        'jacket_path' => 'jackets/withart.jpg',
        'jacket_thumb_path' => 'jackets/thumbs/withart.jpg',
    ]);
    Song::factory()->create(['game_id' => $this->game->id, 'slug' => 'noart', 'title' => 'Zzz no art']);

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            // The grid gets the thumbnail, never the 768px original.
            ->where('songs.0.jacket', '/storage/jackets/thumbs/withart.jpg')
            ->where('songs.1.jacket', null)
        );

    $this->get('/songs/withart')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            // The detail view gets the original, not the thumbnail.
            ->where('song.jackets.0.url', '/storage/jackets/withart.jpg')
        );
});

test('a song with one artwork offers nothing to switch between', function () {
    $song = Song::factory()->create([
        'game_id' => $this->game->id, 'slug' => 'plain',
        'jacket_path' => 'jackets/plain.jpg',
    ]);
    foreach (['PST', 'PRS', 'FTR'] as $difficulty) {
        Chart::factory()->create(['song_id' => $song->id, 'difficulty' => $difficulty]);
    }

    $this->get('/songs/plain')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('song.jackets', 1)
            ->where('song.jackets.0.label', 'PST / PRS / FTR')
        );
});

test('a Beyond chart with its own artwork becomes a second entry, after the shared one', function () {
    $song = Song::factory()->create([
        'game_id' => $this->game->id, 'slug' => 'goodtek',
        'jacket_path' => 'jackets/goodtek.jpg',
    ]);
    foreach (['PST', 'PRS', 'FTR'] as $difficulty) {
        Chart::factory()->create(['song_id' => $song->id, 'difficulty' => $difficulty]);
    }
    Chart::factory()->create([
        'song_id' => $song->id, 'difficulty' => 'BYD',
        'jacket_path' => 'jackets/goodtek_byd.jpg',
    ]);

    $this->get('/songs/goodtek')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('song.jackets', 2)
            ->where('song.jackets.0.label', 'PST / PRS / FTR')
            ->where('song.jackets.0.url', '/storage/jackets/goodtek.jpg')
            ->where('song.jackets.1.label', 'BYD')
            ->where('song.jackets.1.url', '/storage/jackets/goodtek_byd.jpg')
        );
});

test('Past and Present sharing an override come first, as one entry', function () {
    // The Prism / To the Furthest Dream shape: the lower two difficulties carry the alternate
    // artwork and Future keeps the song's own, so the override is the FIRST entry here.
    $song = Song::factory()->create([
        'game_id' => $this->game->id, 'slug' => 'prism',
        'jacket_path' => 'jackets/prism.jpg',
    ]);
    foreach (['PST', 'PRS'] as $difficulty) {
        Chart::factory()->create([
            'song_id' => $song->id, 'difficulty' => $difficulty,
            'jacket_path' => 'jackets/prism_'.strtolower($difficulty).'.jpg',
        ]);
    }
    Chart::factory()->create(['song_id' => $song->id, 'difficulty' => 'FTR']);

    $this->get('/songs/prism')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            // PST and PRS have separate files here, so they do not collapse into each other.
            ->has('song.jackets', 3)
            ->where('song.jackets.0.label', 'PST')
            ->where('song.jackets.2.label', 'FTR')
            ->where('song.jackets.2.url', '/storage/jackets/prism.jpg')
        );
});

test('a chart whose override file is missing falls back and collapses, so no switch appears', function () {
    $song = Song::factory()->create([
        'game_id' => $this->game->id, 'slug' => 'nooverride',
        'jacket_path' => 'jackets/nooverride.jpg',
    ]);
    Chart::factory()->create(['song_id' => $song->id, 'difficulty' => 'FTR']);
    Chart::factory()->create(['song_id' => $song->id, 'difficulty' => 'BYD', 'jacket_path' => null]);

    $this->get('/songs/nooverride')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->has('song.jackets', 1));
});

test('UI strings reach the page as translations instead of being hardcoded in React', function () {
    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('locale', 'en')
            ->where('translations.songs.title', 'Songs')
            ->where('translations.nav.packs', 'Packs')
        );
});
