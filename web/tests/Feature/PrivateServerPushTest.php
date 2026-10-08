<?php

use App\Models\UnofficialChart;
use App\Models\UnofficialSong;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->songsPath = sys_get_temp_dir().'/celestl-songs-'.uniqid();
    mkdir($this->songsPath);

    config([
        'celestl.private_server.url' => 'http://server.test',
        'celestl.private_server.api_token' => 'secret-token',
        'celestl.private_server.songs_path' => $this->songsPath,
    ]);

    Storage::fake('local');
});

afterEach(fn () => File::deleteDirectory($this->songsPath));

/**
 * Fake the server: GET /songs/{id} reports "exists" or not, everything else succeeds.
 */
function fakeServer(bool $songExists): void
{
    Http::fake(function (Request $request) use ($songExists) {
        if ($request->method() === 'GET') {
            return Http::response($songExists
                ? ['code' => 0, 'data' => [], 'msg' => '']
                : ['code' => -2, 'data' => [], 'msg' => 'No data'], 200);
        }

        return Http::response(['code' => 0, 'data' => [], 'msg' => ''], 200);
    });
}

function songWithCharts(): UnofficialSong
{
    $song = UnofficialSong::factory()->create(['slug' => 'my-song', 'title' => 'My Song']);
    Storage::disk('local')->put('unofficial-charts/my-song/FTR.aff', "AudioOffset:0\n-\n");
    UnofficialChart::factory()->create([
        'unofficial_song_id' => $song->id,
        'difficulty' => 'FTR',
        'constant' => 13.5, // di atas 12: sengaja, chart custom tidak dibatasi
        'aff_original_filename' => 'x.aff',
        'aff_storage_path' => 'unofficial-charts/my-song/FTR.aff',
    ]);
    UnofficialChart::factory()->create([
        'unofficial_song_id' => $song->id,
        'difficulty' => 'ETR',
        'constant' => 9.0,
    ]);

    return $song;
}

test('pushing a new song creates it on the server, copies the .aff and refreshes the cache', function () {
    fakeServer(songExists: false);
    $song = songWithCharts();

    actingAsAdmin()->post("/admin/unofficial/songs/{$song->id}/push")
        ->assertRedirect(route('admin.unofficial'))
        ->assertSessionHasNoErrors();

    Http::assertSent(fn (Request $r) => $r->method() === 'POST'
        && $r->url() === 'http://server.test/api/v1/songs'
        && $r->hasHeader('Token', 'secret-token')
        && $r['song_id'] === 'my-song'
        && $r['name'] === 'My Song'
        && collect($r['charts'])->contains(['difficulty' => 2, 'chart_const' => 13.5])
        && collect($r['charts'])->contains(['difficulty' => 4, 'chart_const' => 9.0]));

    // The real server needs a JSON *object* body here (found by running against it, not the fake).
    Http::assertSent(fn (Request $r) => $r->method() === 'POST'
        && str_ends_with($r->url(), '/api/v1/system/operations/refresh_song_file_cache')
        && $r->body() === '{}'
        && $r->hasHeader('Content-Type', 'application/json'));

    // FTR = index 2 on the server. ETR had no .aff uploaded so no file for index 4.
    expect(file_get_contents("{$this->songsPath}/my-song/2.aff"))->toBe("AudioOffset:0\n-\n")
        ->and(file_exists("{$this->songsPath}/my-song/4.aff"))->toBeFalse()
        ->and(UnofficialChart::whereNotNull('pushed_at')->count())->toBe(2);
});

test('pushing a song that already exists on the server updates it with PUT', function () {
    fakeServer(songExists: true);
    $song = songWithCharts();

    actingAsAdmin()->post("/admin/unofficial/songs/{$song->id}/push")->assertSessionHasNoErrors();

    Http::assertSent(fn (Request $r) => $r->method() === 'PUT'
        && $r->url() === 'http://server.test/api/v1/songs/my-song');
    Http::assertNotSent(fn (Request $r) => $r->method() === 'POST' && $r->url() === 'http://server.test/api/v1/songs');
});

test('pushing without a configured token explains what to set', function () {
    config(['celestl.private_server.api_token' => null]);
    Http::fake();
    $song = songWithCharts();

    actingAsAdmin()->post("/admin/unofficial/songs/{$song->id}/push")->assertSessionHasErrors('push');

    Http::assertNothingSent();
});

test('a server-side rejection is reported and nothing is marked as pushed', function () {
    Http::fake(fn (Request $r) => Http::response(
        $r->method() === 'GET'
            ? ['code' => -2, 'data' => [], 'msg' => 'No data']
            : ['code' => -4, 'data' => [], 'msg' => 'Data exist'],
        200,
    ));
    $song = songWithCharts();

    actingAsAdmin()->post("/admin/unofficial/songs/{$song->id}/push")->assertSessionHasErrors('push');

    expect(UnofficialChart::whereNotNull('pushed_at')->count())->toBe(0);
});

test('a rejected token is reported', function () {
    Http::fake(fn () => Http::response(['code' => -1, 'data' => [], 'msg' => 'No permission'], 403));
    $song = songWithCharts();

    actingAsAdmin()->post("/admin/unofficial/songs/{$song->id}/push")->assertSessionHasErrors('push');
});

test('a song with nothing to push is refused', function () {
    Http::fake();
    $song = UnofficialSong::factory()->create();

    actingAsAdmin()->post("/admin/unofficial/songs/{$song->id}/push")->assertSessionHasErrors('push');

    Http::assertNothingSent();
});
