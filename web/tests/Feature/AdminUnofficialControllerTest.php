<?php

use App\Models\UnofficialChart;
use App\Models\UnofficialSong;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('the index page lists custom songs with their chart slots', function () {
    $song = UnofficialSong::factory()->create(['title' => 'My Custom Song']);
    UnofficialChart::factory()->create([
        'unofficial_song_id' => $song->id,
        'difficulty' => 'FTR',
        'constant' => 7.5,
    ]);

    $response = $this->get('/admin/unofficial');

    $response->assertOk();
    $response->assertInertia(
        fn ($page) => $page
            ->component('admin/unofficial')
            ->where('songs.0.title', 'My Custom Song')
            ->where('songs.0.charts.0.difficulty', 'FTR')
    );
});

test('a custom song can be created with a unique slug', function () {
    $response = $this->post('/admin/unofficial/songs', [
        'slug' => 'my-test-song',
        'title' => 'My Test Song',
        'artist' => 'Someone',
    ]);

    $response->assertRedirect(route('admin.unofficial'));
    expect(UnofficialSong::where('slug', 'my-test-song')->exists())->toBeTrue();
});

test('creating a custom song fails with a duplicate slug', function () {
    UnofficialSong::factory()->create(['slug' => 'taken']);

    $response = $this->post('/admin/unofficial/songs', [
        'slug' => 'taken',
        'title' => 'Another title',
    ]);

    $response->assertSessionHasErrors('slug');
});

test('uploading an .aff file for a difficulty stores it on the private disk and records the chart', function () {
    Storage::fake('local');
    $song = UnofficialSong::factory()->create(['slug' => 'my-song']);

    $file = UploadedFile::fake()->createWithContent('chart.aff', "AudioOffset:0;\n");

    $response = $this->post("/admin/unofficial/songs/{$song->id}/charts", [
        'difficulty' => 'FTR',
        'constant' => '9.5',
        'aff' => $file,
    ]);

    $response->assertRedirect(route('admin.unofficial'));

    $chart = UnofficialChart::where('unofficial_song_id', $song->id)
        ->where('difficulty', 'FTR')
        ->sole();

    expect((float) $chart->constant)->toBe(9.5)
        ->and($chart->aff_original_filename)->toBe('chart.aff')
        ->and($chart->aff_storage_path)->toBe('unofficial-charts/my-song/FTR.aff');

    Storage::disk('local')->assertExists('unofficial-charts/my-song/FTR.aff');
});

test('uploading again for the same difficulty updates the existing chart instead of duplicating it', function () {
    Storage::fake('local');
    $song = UnofficialSong::factory()->create();

    $this->post("/admin/unofficial/songs/{$song->id}/charts", [
        'difficulty' => 'PST',
        'constant' => '3.0',
    ]);
    $this->post("/admin/unofficial/songs/{$song->id}/charts", [
        'difficulty' => 'PST',
        'constant' => '3.5',
    ]);

    expect(UnofficialChart::where('unofficial_song_id', $song->id)->where('difficulty', 'PST')->count())->toBe(1)
        ->and((float) UnofficialChart::where('unofficial_song_id', $song->id)->where('difficulty', 'PST')->sole()->constant)->toBe(3.5);
});

test('only the 5 difficulties the base private server supports are accepted', function () {
    $song = UnofficialSong::factory()->create();

    $response = $this->post("/admin/unofficial/songs/{$song->id}/charts", [
        'difficulty' => 'INS',
        'constant' => '10.0',
    ]);

    $response->assertSessionHasErrors('difficulty');
});

test('a constant above 12 is accepted (custom charts are not capped)', function () {
    $song = UnofficialSong::factory()->create();

    $this->post("/admin/unofficial/songs/{$song->id}/charts", [
        'difficulty' => 'ETR',
        'constant' => '13.5',
    ])->assertSessionHasNoErrors();

    expect((float) UnofficialChart::where('unofficial_song_id', $song->id)->sole()->constant)->toBe(13.5);
});

test('a constant with more than 1 decimal digit is rejected', function () {
    $song = UnofficialSong::factory()->create();

    $response = $this->post("/admin/unofficial/songs/{$song->id}/charts", [
        'difficulty' => 'FTR',
        'constant' => '9.55',
    ]);

    $response->assertSessionHasErrors('constant');
});

test('deleting a custom song also deletes its stored .aff files', function () {
    Storage::fake('local');
    $song = UnofficialSong::factory()->create(['slug' => 'to-delete']);
    $file = UploadedFile::fake()->createWithContent('chart.aff', "AudioOffset:0;\n");
    $this->post("/admin/unofficial/songs/{$song->id}/charts", [
        'difficulty' => 'FTR',
        'aff' => $file,
    ]);
    Storage::disk('local')->assertExists('unofficial-charts/to-delete/FTR.aff');

    $this->delete("/admin/unofficial/songs/{$song->id}");

    expect(UnofficialSong::find($song->id))->toBeNull();
    Storage::disk('local')->assertMissing('unofficial-charts/to-delete/FTR.aff');
});
