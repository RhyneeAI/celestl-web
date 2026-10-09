<?php

use App\Lamp;
use App\Models\Chart;
use App\Models\Game;
use App\Models\Play;
use App\Models\Song;
use App\PlaySource;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->game = Game::factory()->create(['slug' => 'arcaea', 'name' => 'Arcaea']);
});

test('the calculator ships the catalogue with each chart constant', function () {
    $song = Song::factory()->create([
        'game_id' => $this->game->id,
        'slug' => 'lucifer',
        'title' => 'Lucifer',
        'artist' => 'chitose',
    ]);
    Chart::factory()->create([
        'song_id' => $song->id, 'difficulty' => 'FTR',
        'level' => '8', 'constant' => 8.2,
    ]);

    $this->get('/calculator')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('calculator')
            ->has('songs', 1)
            ->where('songs.0.title', 'Lucifer')
            // A float, not a string: the browser does arithmetic with it.
            ->where('songs.0.charts.0.constant', 8.2)
            ->where('songs.0.charts.0.level', '8')
        );
});

test('charts arrive in difficulty order, not insertion order', function () {
    $song = Song::factory()->create(['game_id' => $this->game->id, 'slug' => 'ordered']);

    foreach (['BYD', 'PST', 'FTR'] as $difficulty) {
        Chart::factory()->create(['song_id' => $song->id, 'difficulty' => $difficulty]);
    }

    $this->get('/calculator')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('songs.0.charts.0.difficulty', 'PST')
            ->where('songs.0.charts.1.difficulty', 'FTR')
            ->where('songs.0.charts.2.difficulty', 'BYD')
        );
});

test('a chart with no constant is sent as null rather than a guess', function () {
    // Three real charts have no community rating. A made-up constant would produce a confident,
    // wrong rating, so the page has to be told there is none.
    $song = Song::factory()->create(['game_id' => $this->game->id, 'slug' => 'unrated']);
    Chart::factory()->create([
        'song_id' => $song->id, 'difficulty' => 'FTR',
        'level' => '?', 'constant' => null,
    ]);

    $this->get('/calculator')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('songs.0.charts.0.constant', null)
        );
});

test('the calculator is public, not behind the admin gate', function () {
    $this->get('/calculator')->assertOk();
});

test('a play can be logged without an owner', function () {
    // The owner's decision: user_id stays nullable so rows logged before accounts exist (Fase 4)
    // can be adopted later with an UPDATE instead of a migration.
    $song = Song::factory()->create(['game_id' => $this->game->id]);
    $chart = Chart::factory()->create(['song_id' => $song->id, 'difficulty' => 'FTR']);

    $play = Play::query()->create([
        'user_id' => null,
        'chart_id' => $chart->id,
        'score' => 9_900_167,
        'lamp' => Lamp::NormalClear,
        'source' => PlaySource::Manual,
        'played_at' => now(),
    ]);

    expect($play->fresh()->user_id)->toBeNull()
        ->and($play->fresh()->lamp)->toBe(Lamp::NormalClear)
        ->and($play->fresh()->source)->toBe(PlaySource::Manual)
        ->and($play->chart->is($chart))->toBeTrue();
});
