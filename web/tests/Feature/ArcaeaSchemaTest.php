<?php

use App\Difficulty;
use App\Models\Chart;
use App\Models\Game;
use App\Models\Pack;
use App\Models\Song;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('a song belongs to a game and an optional pack', function () {
    $game = Game::factory()->create(['slug' => 'arcaea', 'name' => 'Arcaea']);
    $pack = Pack::factory()->create(['game_id' => $game->id]);
    $song = Song::factory()->create(['game_id' => $game->id, 'pack_id' => $pack->id]);

    expect($song->game->is($game))->toBeTrue()
        ->and($song->pack->is($pack))->toBeTrue();

    $orphan = Song::factory()->create(['game_id' => $game->id, 'pack_id' => null]);
    expect($orphan->pack)->toBeNull();
});

test('a pack can have child packs (chapter/append)', function () {
    $parent = Pack::factory()->create(['slug' => 'eden', 'name' => 'Lasting Eden']);
    $child = Pack::factory()->create([
        'game_id' => $parent->game_id,
        'slug' => 'eden_append_1',
        'name' => 'Lasting Eden Chapter 2',
        'parent_id' => $parent->id,
    ]);

    expect($parent->children)->toHaveCount(1)
        ->and($parent->children->first()->is($child))->toBeTrue()
        ->and($child->parent->is($parent))->toBeTrue();
});

test('a chart casts difficulty to the Difficulty enum', function () {
    $chart = Chart::factory()->create(['difficulty' => 'FTR']);

    expect($chart->fresh()->difficulty)->toBe(Difficulty::Future);
});

test('a chart level can be a non-numeric string like "?" for April Fools songs', function () {
    $chart = Chart::factory()->create(['level' => '?', 'constant' => null]);

    expect($chart->fresh()->level)->toBe('?')
        ->and($chart->fresh()->constant)->toBeNull();
});

test('a song cannot have two charts of the same difficulty', function () {
    $song = Song::factory()->create();
    Chart::factory()->create(['song_id' => $song->id, 'difficulty' => 'FTR']);

    expect(fn () => Chart::factory()->create(['song_id' => $song->id, 'difficulty' => 'FTR']))
        ->toThrow(QueryException::class);
});

test('a game cannot have two songs with the same slug', function () {
    $game = Game::factory()->create();
    Song::factory()->create(['game_id' => $game->id, 'slug' => 'extradimensional']);

    expect(fn () => Song::factory()->create(['game_id' => $game->id, 'slug' => 'extradimensional']))
        ->toThrow(QueryException::class);
});

test('Difficulty::fromRatingClass forces Inscribed when ratingClassAlias is 1, regardless of raw ratingClass', function () {
    // Divine Oblivion's 4 legacy-Inscribed charts: ratingClass 3 (Beyond's slot) + ratingClassAlias 1.
    expect(Difficulty::fromRatingClass(3, 1))->toBe(Difficulty::Inscribed)
        ->and(Difficulty::fromRatingClass(3, null))->toBe(Difficulty::Beyond)
        ->and(Difficulty::fromRatingClass(0))->toBe(Difficulty::Past)
        ->and(Difficulty::fromRatingClass(5))->toBe(Difficulty::Inscribed);
});
