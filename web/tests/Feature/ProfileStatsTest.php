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
    $this->user = User::factory()->create();
    GameIdentity::factory()->create(['user_id' => $this->user->id, 'game_id' => $this->game->id]);
});

function logPlay(Chart $chart, int $score, Lamp $lamp = Lamp::Lost): Play
{
    return Play::query()->create([
        'user_id' => test()->user->id,
        'chart_id' => $chart->id,
        'score' => $score,
        'lamp' => $lamp,
        'source' => PlaySource::Manual,
        'played_at' => now(),
    ]);
}

function chartWith(?float $constant, string $difficulty = 'FTR', string $title = 'Song'): Chart
{
    $song = Song::factory()->create([
        'game_id' => test()->game->id,
        'slug' => str($title)->slug()->toString().'-'.fake()->unique()->numberBetween(1, 99999),
        'title' => $title,
    ]);

    return Chart::factory()->create([
        'song_id' => $song->id, 'difficulty' => $difficulty, 'constant' => $constant,
    ]);
}

test('a brand new account shows nothing rather than zeroes dressed as data', function () {
    $this->actingAs($this->user)
        ->get('/profile')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('stats.plays', 0)
            ->where('stats.top_average', null)
            ->where('stats.best', null)
        );
});

test('it counts plays and distinct charts separately', function () {
    $chart = chartWith(10.4);
    logPlay($chart, 9_500_000);
    logPlay($chart, 9_900_000);
    logPlay(chartWith(9.0), 9_800_000);

    $this->actingAs($this->user)
        ->get('/profile')
        ->assertInertia(fn ($page) => $page
            ->where('stats.plays', 3)
            ->where('stats.charts', 2)
        );
});

test('a chart counts once, by your best result on it', function () {
    // Ten attempts at one song must not crowd out nine other songs.
    $chart = chartWith(10.4);
    logPlay($chart, 9_200_000);
    logPlay($chart, 10_000_000);

    $this->actingAs($this->user)
        ->get('/profile')
        ->assertInertia(fn ($page) => $page
            ->where('stats.charts', 1)
            // The better attempt wins: 10.4 + 2.0, no clear bonus on a Lost.
            ->where('stats.best.rating', 12.4)
            ->where('stats.top_average', 12.4)
        );
});

test('the average covers only the top 50 charts, and says how many it counted', function () {
    // 51 charts: the weakest must fall outside the average.
    foreach (range(1, 51) as $index) {
        logPlay(chartWith(10.0), 9_500_000 + $index);
    }

    $this->actingAs($this->user)
        ->get('/profile')
        ->assertInertia(fn ($page) => $page
            ->where('stats.charts', 51)
            ->where('stats.top_counted', 50)
        );
});

test('charts with no community constant are left out of the ranking entirely', function () {
    // A guessed constant would produce a confident, wrong average.
    logPlay(chartWith(null), 10_000_000);
    logPlay(chartWith(10.4), 9_500_000);

    $this->actingAs($this->user)
        ->get('/profile')
        ->assertInertia(fn ($page) => $page
            // Both plays are logged, but only the rateable one can be ranked.
            ->where('stats.plays', 2)
            ->where('stats.charts', 1)
            ->where('stats.top_average', 10.4)
        );
});

test('the best play carries enough to link to the song', function () {
    $chart = chartWith(11.3, 'ETR', 'Extradimensional');
    logPlay($chart, 9_900_167, Lamp::NormalClear);

    $this->actingAs($this->user)
        ->get('/profile')
        ->assertInertia(fn ($page) => $page
            ->where('stats.best.title', 'Extradimensional')
            ->where('stats.best.difficulty', 'ETR')
            ->where('stats.best.score', 9_900_167)
            // The figure the game itself prints for this play.
            ->where('stats.best.rating', 13.000835)
        );
});

test('one account never sees another account\'s plays', function () {
    $someoneElse = User::factory()->create();
    $chart = chartWith(10.4);
    Play::query()->create([
        'user_id' => $someoneElse->id, 'chart_id' => $chart->id, 'score' => 10_000_000,
        'lamp' => Lamp::Lost, 'source' => PlaySource::Manual, 'played_at' => now(),
    ]);

    $this->actingAs($this->user)
        ->get('/profile')
        ->assertInertia(fn ($page) => $page->where('stats.plays', 0));
});
