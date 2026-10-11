<?php

use App\Models\Game;
use App\Models\GameIdentity;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->game = Game::factory()->create(['slug' => 'arcaea', 'name' => 'Arcaea']);
});

function identityFor(string $playerId, string $nickname): GameIdentity
{
    return GameIdentity::factory()->create([
        'user_id' => User::factory(),
        'game_id' => test()->game->id,
        'identifier_value' => $playerId,
        'display_name' => $nickname,
    ]);
}

test('registering creates an account with its game identity and signs you in', function () {
    $this->post('/register', ['player_id' => '160 500 737', 'nickname' => 'AnisphiaaaUwU'])
        ->assertRedirect(route('profile'));

    $identity = GameIdentity::query()->sole();

    expect($identity->identifier_value)->toBe('160500737')
        ->and($identity->display_name)->toBe('AnisphiaaaUwU')
        ->and($identity->identifier_type)->toBe(GameIdentity::TYPE_PLAYER_ID);

    $this->assertAuthenticatedAs($identity->user);
});

test('a player id is rejected unless it is nine digits', function (string $playerId) {
    $this->post('/register', ['player_id' => $playerId, 'nickname' => 'Someone'])
        ->assertSessionHasErrors('player_id');

    expect(User::query()->count())->toBe(0);
})->with(['12345', '1234567890', 'not-a-number', '']);

test('a player id already registered here is refused', function () {
    identityFor('160500737', 'Taken');

    $this->post('/register', ['player_id' => '160 500 737', 'nickname' => 'Someone else'])
        ->assertSessionHasErrors('player_id');

    expect(User::query()->count())->toBe(1);
});

test('a failed registration leaves no half-made account behind', function () {
    // An account with no identity could never be signed into again.
    $this->post('/register', ['player_id' => 'nope', 'nickname' => '']);

    expect(User::query()->count())->toBe(0)
        ->and(GameIdentity::query()->count())->toBe(0);
});

test('signing in works by player id, however it is spaced', function (string $typed) {
    $identity = identityFor('160500737', 'AnisphiaaaUwU');

    $this->post('/login', ['identity' => $typed])->assertRedirect(route('profile'));

    $this->assertAuthenticatedAs($identity->user);
})->with(['160500737', '160 500 737', '  160500737 ']);

test('signing in works by nickname', function () {
    $identity = identityFor('160500737', 'AnisphiaaaUwU');

    $this->post('/login', ['identity' => 'AnisphiaaaUwU'])->assertRedirect(route('profile'));

    $this->assertAuthenticatedAs($identity->user);
});

test('a nickname shared by two accounts asks for the player id instead of guessing', function () {
    // Guessing here would sign someone into a stranger's history because they picked the same name.
    identityFor('160500737', 'Anisphia');
    identityFor('160500738', 'Anisphia');

    $this->post('/login', ['identity' => 'Anisphia'])->assertSessionHasErrors('identity');

    $this->assertGuest();
});

test('that same nickname still signs in by player id', function () {
    $first = identityFor('160500737', 'Anisphia');
    identityFor('160500738', 'Anisphia');

    $this->post('/login', ['identity' => '160500737'])->assertRedirect(route('profile'));

    $this->assertAuthenticatedAs($first->user);
});

test('an unknown identity is refused', function () {
    $this->post('/login', ['identity' => '999999999'])->assertSessionHasErrors('identity');

    $this->assertGuest();
});

test('an identity from another game does not sign you in here', function () {
    $other = Game::factory()->create(['slug' => 'rotaeno']);
    GameIdentity::factory()->create([
        'game_id' => $other->id,
        'identifier_value' => '160500737',
        'display_name' => 'Elsewhere',
    ]);

    $this->post('/login', ['identity' => '160500737'])->assertSessionHasErrors('identity');

    $this->assertGuest();
});

test('signing in rotates the session id', function () {
    identityFor('160500737', 'AnisphiaaaUwU');
    $this->get('/login');
    $before = session()->getId();

    $this->post('/login', ['identity' => '160500737']);

    expect(session()->getId())->not->toBe($before);
});

test('signing out ends the session', function () {
    $identity = identityFor('160500737', 'AnisphiaaaUwU');

    $this->actingAs($identity->user)->post('/logout')->assertRedirect(route('home'));

    $this->assertGuest();
});

test('the profile needs an account', function () {
    $this->get('/profile')->assertRedirect(route('login'));
});

test('the profile shows the identity, with the player id grouped again', function () {
    $identity = identityFor('160500737', 'AnisphiaaaUwU');

    $this->actingAs($identity->user)
        ->get('/profile')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('account/profile')
            ->where('identity.nickname', 'AnisphiaaaUwU')
            ->where('identity.player_id', '160 500 737')
        );
});

test('someone already signed in is sent to their profile, not the forms', function () {
    $identity = identityFor('160500737', 'AnisphiaaaUwU');

    $this->actingAs($identity->user)->get('/login')->assertRedirect(route('profile'));
    $this->actingAs($identity->user)->get('/register')->assertRedirect(route('profile'));
});

test('guest mode: every public page stays open without an account', function (string $path) {
    $this->get($path)->assertOk();
})->with(['/', '/packs', '/calculator', '/login', '/register']);

test('the chrome knows whether you are signed in', function () {
    $identity = identityFor('160500737', 'AnisphiaaaUwU');

    $this->get('/calculator')
        ->assertInertia(fn ($page) => $page->where('auth', null));

    $this->actingAs($identity->user)
        ->get('/calculator')
        ->assertInertia(fn ($page) => $page->where('auth.nickname', 'AnisphiaaaUwU'));
});
