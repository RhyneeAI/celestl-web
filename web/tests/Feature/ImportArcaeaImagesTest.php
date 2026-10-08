<?php

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

test('it fails clearly when the data folder is missing', function () {
    config(['celestl.arcaea_data_path' => base_path('tests/fixtures/does-not-exist')]);

    $this->artisan('celestl:import-arcaea-images')->assertFailed();
});
