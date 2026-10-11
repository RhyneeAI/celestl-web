<?php

use App\Models\Game;
use App\Models\GameIdentity;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;

uses(RefreshDatabase::class);

test('an account carries no personal details of its own', function () {
    // No name, no email, no password: everything identifying lives on the game identity.
    // remember_token is the one survivor, and it is sign-in plumbing, not a personal detail.
    $columns = Schema::getColumnListing('users');

    expect($columns)->toEqualCanonicalizing(['id', 'remember_token', 'created_at', 'updated_at']);
});

test('a player id is stored as bare digits however it was typed', function (string $typed) {
    expect(GameIdentity::normalizePlayerId($typed))->toBe('160500737');
})->with([
    'as printed in game' => '160 500 737',
    'already bare' => '160500737',
    'with stray spaces' => '  160  500 737 ',
    'with punctuation' => '160-500-737',
]);

test('a stored player id is displayed grouped again', function () {
    $identity = GameIdentity::factory()->create(['identifier_value' => '160500737']);

    expect($identity->formattedIdentifier())->toBe('160 500 737');
});

test('two accounts cannot claim the same player id in one game', function () {
    $game = Game::factory()->create();
    GameIdentity::factory()->create(['game_id' => $game->id, 'identifier_value' => '160500737']);

    expect(fn () => GameIdentity::factory()->create([
        'game_id' => $game->id,
        'identifier_value' => '160500737',
    ]))->toThrow(QueryException::class);
});

test('the same player id may exist in two different games', function () {
    // Nothing says an Arcaea id and a future game's id cannot collide numerically.
    $arcaea = Game::factory()->create(['slug' => 'arcaea']);
    $other = Game::factory()->create(['slug' => 'rotaeno']);

    GameIdentity::factory()->create(['game_id' => $arcaea->id, 'identifier_value' => '160500737']);
    GameIdentity::factory()->create(['game_id' => $other->id, 'identifier_value' => '160500737']);

    expect(GameIdentity::query()->where('identifier_value', '160500737')->count())->toBe(2);
});

test('two accounts may share a nickname, because the game allows it', function () {
    // Arcaea lets anyone change their username at any time, so a collision is legitimate data,
    // not an error. Sign-in has to cope with it rather than the database forbidding it.
    $game = Game::factory()->create();

    GameIdentity::factory()->create(['game_id' => $game->id, 'display_name' => 'Anisphia']);
    GameIdentity::factory()->create(['game_id' => $game->id, 'display_name' => 'Anisphia']);

    expect(GameIdentity::query()->where('display_name', 'Anisphia')->count())->toBe(2);
});

test('an account can hold one identity per game and find it by game', function () {
    $user = User::factory()->create();
    $arcaea = Game::factory()->create(['slug' => 'arcaea']);
    $other = Game::factory()->create(['slug' => 'rotaeno']);

    GameIdentity::factory()->create([
        'user_id' => $user->id, 'game_id' => $arcaea->id, 'display_name' => 'AnisphiaaaUwU',
    ]);
    GameIdentity::factory()->create(['user_id' => $user->id, 'game_id' => $other->id]);

    expect($user->gameIdentities)->toHaveCount(2)
        ->and($user->identityFor('arcaea')->display_name)->toBe('AnisphiaaaUwU')
        ->and($user->identityFor('nothing-like-this'))->toBeNull();
});

test('deleting an account takes its identities with it', function () {
    $user = User::factory()->create();
    GameIdentity::factory()->create(['user_id' => $user->id]);

    $user->delete();

    expect(GameIdentity::query()->count())->toBe(0);
});
