<?php

use App\Models\Chart;
use App\Models\Pack;
use App\Models\Song;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

/**
 * Images are generated here rather than committed: the real jacket/pack art is copyrighted and must
 * never enter this repo (CLAUDE.md § Data dan hak cipta).
 */
beforeEach(function () {
    Storage::fake('public');

    $this->source = base_path('tests/fixtures/arcaea-images');
    File::ensureDirectoryExists("{$this->source}/jackets");
    File::ensureDirectoryExists("{$this->source}/packs");

    config(['celestl.arcaea_data_path' => $this->source]);
});

afterEach(function () {
    File::deleteDirectory($this->source);
});

function makeJpeg(string $path, int $size = 768): void
{
    $image = imagecreatetruecolor($size, $size);
    imagefill($image, 0, 0, imagecolorallocate($image, 10, 120, 200));
    imagejpeg($image, $path);
    imagedestroy($image);
}

function makeTransparentPng(string $path, int $width = 374, int $height = 750): void
{
    $image = imagecreatetruecolor($width, $height);
    imagealphablending($image, false);
    imagesavealpha($image, true);
    imagefill($image, 0, 0, imagecolorallocatealpha($image, 0, 0, 0, 127));
    imagepng($image, $path);
    imagedestroy($image);
}

test('it copies a jacket, builds a thumbnail, and records both paths', function () {
    $song = Song::factory()->create(['slug' => 'testsong']);
    makeJpeg("{$this->source}/jackets/testsong.jpg");

    $this->artisan('celestl:import-arcaea-images')->assertSuccessful();

    Storage::disk('public')->assertExists('jackets/testsong.jpg');
    Storage::disk('public')->assertExists('jackets/thumbs/testsong.jpg');

    expect($song->fresh()->jacket_path)->toBe('jackets/testsong.jpg')
        ->and($song->fresh()->jacket_thumb_path)->toBe('jackets/thumbs/testsong.jpg');

    // The thumbnail must actually be smaller than the 768px source, or it is pointless.
    [$width] = getimagesize(Storage::disk('public')->path('jackets/thumbs/testsong.jpg'));
    expect($width)->toBe(384);
});

test('a song with no source file keeps null paths instead of a broken one', function () {
    $song = Song::factory()->create(['slug' => 'artless']);

    $this->artisan('celestl:import-arcaea-images')->assertSuccessful();

    expect($song->fresh()->jacket_path)->toBeNull()
        ->and($song->fresh()->jacket_thumb_path)->toBeNull();
});

test('pack thumbnails keep their alpha channel', function () {
    // The pack card's aspect ratio is measured from the non-transparent bounding box, so flattening
    // the alpha here would quietly change every card's shape (CLAUDE.md § tinggi kartu Pack).
    Pack::factory()->create(['slug' => 'testpack']);
    makeTransparentPng("{$this->source}/packs/testpack.png");

    $this->artisan('celestl:import-arcaea-images')->assertSuccessful();

    $thumb = imagecreatefrompng(Storage::disk('public')->path('packs/thumbs/testpack.png'));
    $corner = imagecolorsforindex($thumb, imagecolorat($thumb, 0, 0));

    expect($corner['alpha'])->toBe(127)
        ->and(imagesx($thumb))->toBeLessThan(374);
});

test('a chapter pack falls back to its parent art', function () {
    $parent = Pack::factory()->create(['slug' => 'eden']);
    $child = Pack::factory()->create(['slug' => 'eden_append_1', 'parent_id' => $parent->id]);
    makeTransparentPng("{$this->source}/packs/eden.png");

    $this->artisan('celestl:import-arcaea-images')->assertSuccessful();

    Storage::disk('public')->assertExists('packs/eden_append_1.png');
    expect($child->fresh()->image_path)->toBe('packs/eden_append_1.png');
});

test('it is idempotent and re-run reports nothing copied', function () {
    Song::factory()->create(['slug' => 'testsong']);
    makeJpeg("{$this->source}/jackets/testsong.jpg");

    $this->artisan('celestl:import-arcaea-images')->assertSuccessful();
    $firstRun = filemtime(Storage::disk('public')->path('jackets/testsong.jpg'));

    $this->artisan('celestl:import-arcaea-images')
        ->expectsOutputToContain('0 copied, 1 already present')
        ->assertSuccessful();

    expect(filemtime(Storage::disk('public')->path('jackets/testsong.jpg')))->toBe($firstRun);
});

test('it rebuilds existing files with --force', function () {
    Song::factory()->create(['slug' => 'testsong']);
    makeJpeg("{$this->source}/jackets/testsong.jpg");
    $this->artisan('celestl:import-arcaea-images')->assertSuccessful();

    // Replace the source with a visibly different image; --force must pick it up.
    makeJpeg("{$this->source}/jackets/testsong.jpg", 256);

    $this->artisan('celestl:import-arcaea-images', ['--force' => true])->assertSuccessful();

    [$width] = getimagesize(Storage::disk('public')->path('jackets/testsong.jpg'));
    expect($width)->toBe(256);
});

test('it imports a per-difficulty jacket override onto its chart', function () {
    $song = Song::factory()->create(['slug' => 'goodtek']);
    $shared = Chart::factory()->create(['song_id' => $song->id, 'difficulty' => 'FTR']);
    $override = Chart::factory()->create(['song_id' => $song->id, 'difficulty' => 'BYD']);

    makeJpeg("{$this->source}/jackets/goodtek.jpg");
    // A visibly different image, so it is not deduplicated against the song's own jacket.
    makeJpeg("{$this->source}/jackets/goodtek_byd.jpg", 512);

    $this->artisan('celestl:import-arcaea-images')->assertSuccessful();

    Storage::disk('public')->assertExists('jackets/goodtek_byd.jpg');
    Storage::disk('public')->assertExists('jackets/thumbs/goodtek_byd.jpg');

    expect($override->fresh()->jacket_path)->toBe('jackets/goodtek_byd.jpg')
        // The chart that has no override of its own keeps null and falls back to the song.
        ->and($shared->fresh()->jacket_path)->toBeNull();
});

test('an override identical to the song jacket is left as a fallback, not duplicated', function () {
    $song = Song::factory()->create(['slug' => 'sameart']);
    $chart = Chart::factory()->create(['song_id' => $song->id, 'difficulty' => 'BYD']);

    makeJpeg("{$this->source}/jackets/sameart.jpg");
    copy("{$this->source}/jackets/sameart.jpg", "{$this->source}/jackets/sameart_byd.jpg");

    $this->artisan('celestl:import-arcaea-images')->assertSuccessful();

    // Same picture under another name: the page would otherwise show a switch between two
    // identical images (the Prism / To the Furthest Dream shape).
    expect($chart->fresh()->jacket_path)->toBeNull();
    Storage::disk('public')->assertMissing('jackets/sameart_byd.jpg');
});

test('two difficulties sharing one override picture share one published file', function () {
    $song = Song::factory()->create(['slug' => 'prism']);
    $past = Chart::factory()->create(['song_id' => $song->id, 'difficulty' => 'PST']);
    $present = Chart::factory()->create(['song_id' => $song->id, 'difficulty' => 'PRS']);
    Chart::factory()->create(['song_id' => $song->id, 'difficulty' => 'FTR']);

    makeJpeg("{$this->source}/jackets/prism.jpg");
    makeJpeg("{$this->source}/jackets/prism_pst.jpg", 512);
    copy("{$this->source}/jackets/prism_pst.jpg", "{$this->source}/jackets/prism_prs.jpg");

    $this->artisan('celestl:import-arcaea-images')->assertSuccessful();

    expect($past->fresh()->jacket_path)->toBe('jackets/prism_pst.jpg')
        ->and($present->fresh()->jacket_path)->toBe('jackets/prism_pst.jpg');

    Storage::disk('public')->assertMissing('jackets/prism_prs.jpg');
});

test('a truncated or empty source file is skipped, not fatal', function () {
    // A failed download leaves a 0-byte .jpg behind. Handing one to GD raises a warning that
    // Laravel turns into an exception, which used to abort the whole import on the first bad file.
    $good = Song::factory()->create(['slug' => 'good']);
    $broken = Song::factory()->create(['slug' => 'broken']);

    makeJpeg("{$this->source}/jackets/good.jpg");
    touch("{$this->source}/jackets/broken.jpg");

    $this->artisan('celestl:import-arcaea-images')->assertSuccessful();

    // The good one still went through, and the broken one was left alone entirely.
    expect($good->fresh()->jacket_path)->toBe('jackets/good.jpg')
        ->and($broken->fresh()->jacket_path)->toBeNull();

    Storage::disk('public')->assertMissing('jackets/broken.jpg');
});

test('a chart whose override file is broken falls back to the song jacket', function () {
    $song = Song::factory()->create(['slug' => 'partial']);
    $chart = Chart::factory()->create(['song_id' => $song->id, 'difficulty' => 'BYD']);

    makeJpeg("{$this->source}/jackets/partial.jpg");
    touch("{$this->source}/jackets/partial_byd.jpg");

    $this->artisan('celestl:import-arcaea-images')->assertSuccessful();

    expect($song->fresh()->jacket_path)->toBe('jackets/partial.jpg')
        ->and($chart->fresh()->jacket_path)->toBeNull();

    Storage::disk('public')->assertMissing('jackets/partial_byd.jpg');
});

test('it fails clearly when the data folder is missing', function () {
    config(['celestl.arcaea_data_path' => base_path('tests/fixtures/does-not-exist')]);

    $this->artisan('celestl:import-arcaea-images')->assertFailed();
});
