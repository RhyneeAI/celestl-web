<?php

use App\Lamp;
use App\Models\Chart;
use App\Models\Game;
use App\Models\GameIdentity;
use App\Models\Play;
use App\Models\Song;
use App\Models\User;
use App\PlaySource;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->game = Game::factory()->create(['slug' => 'arcaea', 'name' => 'Arcaea']);
    $this->song = Song::factory()->create(['game_id' => $this->game->id, 'slug' => 'lucifer', 'title' => 'Lucifer']);
    $this->chart = Chart::factory()->create([
        'song_id' => $this->song->id, 'difficulty' => 'FTR', 'constant' => 8.2,
    ]);
    $this->user = User::factory()->create();
    GameIdentity::factory()->create(['user_id' => $this->user->id, 'game_id' => $this->game->id]);
});

test('a guest gets no server history and cannot log a play', function () {
    // Signed out, history stays in the browser -- null is how the page knows that.
    $this->get('/calculator')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('history', null));

    $this->post('/plays', [
        'slug' => 'lucifer', 'difficulty' => 'FTR', 'score' => 9_900_000, 'lamp' => 'normal_clear',
    ])->assertRedirect(route('login'));

    expect(Play::query()->count())->toBe(0);
});

test('signing in turns the calculator history into server history', function () {
    $this->actingAs($this->user)
        ->get('/calculator')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('history', 0));
});

test('a logged play is attributed, dated and marked manual', function () {
    $this->actingAs($this->user)->post('/plays', [
        'slug' => 'lucifer', 'difficulty' => 'FTR', 'score' => 9_900_000, 'lamp' => 'pure_memory',
    ])->assertRedirect();

    $play = Play::query()->sole();

    expect($play->user_id)->toBe($this->user->id)
        ->and($play->chart_id)->toBe($this->chart->id)
        ->and($play->lamp)->toBe(Lamp::PureMemory)
        ->and($play->source)->toBe(PlaySource::Manual)
        ->and($play->played_at)->not->toBeNull();
});

test('history carries a rating recomputed from the chart, not a stored one', function () {
    // constant 8.2 + modifier(9,900,000)=1.5 + clear bonus 0.2
    $this->actingAs($this->user)->post('/plays', [
        'slug' => 'lucifer', 'difficulty' => 'FTR', 'score' => 9_900_000, 'lamp' => 'normal_clear',
    ]);

    $this->actingAs($this->user)
        ->get('/calculator')
        ->assertInertia(fn ($page) => $page
            ->has('history', 1)
            ->where('history.0.title', 'Lucifer')
            ->where('history.0.rating', 9.9)
        );
});

test('a play on a chart with no constant has no rating rather than a wrong one', function () {
    $chart = Chart::factory()->create([
        'song_id' => $this->song->id, 'difficulty' => 'BYD', 'constant' => null,
    ]);
    Play::query()->create([
        'user_id' => $this->user->id, 'chart_id' => $chart->id, 'score' => 9_900_000,
        'lamp' => Lamp::NormalClear, 'source' => PlaySource::Manual, 'played_at' => now(),
    ]);

    $this->actingAs($this->user)
        ->get('/calculator')
        ->assertInertia(fn ($page) => $page->where('history.0.rating', null));
});

test('an unknown song or difficulty is refused', function (string $slug, string $difficulty) {
    $this->actingAs($this->user)->post('/plays', [
        'slug' => $slug, 'difficulty' => $difficulty, 'score' => 9_900_000, 'lamp' => 'normal_clear',
    ])->assertSessionHasErrors('slug');

    expect(Play::query()->count())->toBe(0);
})->with([
    'no such song' => ['nothing-like-this', 'FTR'],
    'song has no such difficulty' => ['lucifer', 'ETR'],
]);

test('an invalid lamp or score is refused', function (array $payload, string $field) {
    $this->actingAs($this->user)
        ->post('/plays', array_merge([
            'slug' => 'lucifer', 'difficulty' => 'FTR', 'score' => 9_900_000, 'lamp' => 'normal_clear',
        ], $payload))
        ->assertSessionHasErrors($field);
})->with([
    'made-up lamp' => [['lamp' => 'perfect_clear'], 'lamp'],
    'negative score' => [['score' => -1], 'score'],
    'impossible score' => [['score' => 99_000_000], 'score'],
]);

test('you can delete your own play', function () {
    $play = Play::query()->create([
        'user_id' => $this->user->id, 'chart_id' => $this->chart->id, 'score' => 9_900_000,
        'lamp' => Lamp::NormalClear, 'source' => PlaySource::Manual, 'played_at' => now(),
    ]);

    $this->actingAs($this->user)->delete("/plays/{$play->id}")->assertRedirect();

    expect(Play::query()->count())->toBe(0);
});

test('you cannot delete someone else\'s play', function () {
    $someoneElse = User::factory()->create();
    $play = Play::query()->create([
        'user_id' => $someoneElse->id, 'chart_id' => $this->chart->id, 'score' => 9_900_000,
        'lamp' => Lamp::NormalClear, 'source' => PlaySource::Manual, 'played_at' => now(),
    ]);

    $this->actingAs($this->user)->delete("/plays/{$play->id}")->assertNotFound();

    expect(Play::query()->count())->toBe(1);
});

test('importing adopts browser history, keeping when each was calculated', function () {
    $when = now()->subDays(3)->startOfSecond();

    $this->actingAs($this->user)->post('/plays/import', [
        'plays' => [[
            'slug' => 'lucifer', 'difficulty' => 'FTR', 'score' => 9_912_345,
            'lamp' => 'hard_clear', 'playedAt' => $when->toIso8601String(),
        ]],
    ])->assertRedirect()->assertSessionHas('imported', 1);

    $play = Play::query()->sole();

    expect($play->user_id)->toBe($this->user->id)
        ->and($play->score)->toBe(9_912_345)
        // Not "now": an import should not look like a burst of plays made at sign-in.
        ->and($play->played_at->toIso8601String())->toBe($when->toIso8601String());
});

test('an import skips rows naming a chart that no longer exists, keeping the rest', function () {
    // localStorage is editable and can go stale; one bad row must not lose the good ones.
    $this->actingAs($this->user)->post('/plays/import', [
        'plays' => [
            ['slug' => 'gone', 'difficulty' => 'FTR', 'score' => 9_000_000, 'lamp' => 'lost'],
            ['slug' => 'lucifer', 'difficulty' => 'FTR', 'score' => 9_900_000, 'lamp' => 'lost'],
        ],
    ])->assertSessionHas('imported', 1);

    expect(Play::query()->count())->toBe(1);
});

test('an import with a tampered row is refused outright', function () {
    $this->actingAs($this->user)->post('/plays/import', [
        'plays' => [['slug' => 'lucifer', 'difficulty' => 'FTR', 'score' => 99_000_000, 'lamp' => 'lost']],
    ])->assertSessionHasErrors('plays.0.score');

    expect(Play::query()->count())->toBe(0);
});

test('a guest cannot import into anyone', function () {
    $this->post('/plays/import', [
        'plays' => [['slug' => 'lucifer', 'difficulty' => 'FTR', 'score' => 9_900_000, 'lamp' => 'lost']],
    ])->assertRedirect(route('login'));

    expect(Play::query()->count())->toBe(0);
});
