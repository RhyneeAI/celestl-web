<?php

use App\Difficulty;
use App\Models\Chart;
use App\Models\Pack;
use App\Models\Song;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['celestl.arcaea_data_path' => base_path('tests/fixtures/arcaea-data')]);
});

test('it imports packs including parent/child and small_pack_image', function () {
    $this->artisan('celestl:import-arcaea-content')->assertSuccessful();

    $parent = Pack::query()->where('slug', 'testpack')->sole();
    $child = Pack::query()->where('slug', 'testpack_append_1')->sole();
    $small = Pack::query()->where('slug', 'smallpack')->sole();

    expect($parent->section)->toBe('Arcaea')
        ->and($child->parent_id)->toBe($parent->id)
        ->and($small->section)->toBe('Variety')
        ->and($small->small_pack_image)->toBeTrue();
});

test('it imports a song with its pack, and leaves pack_id null for "single"', function () {
    $this->artisan('celestl:import-arcaea-content')->assertSuccessful();

    $song = Song::query()->where('slug', 'testsong')->sole();
    $noPack = Song::query()->where('slug', 'nopack')->sole();

    expect($song->pack->slug)->toBe('testpack')
        ->and($song->title)->toBe('Test Song')
        ->and($song->side)->toBe('Conflict')
        ->and($song->length)->toBe('2:30')
        ->and($song->released_at->toDateString())->toBe('2023-11-14')
        ->and($noPack->pack_id)->toBeNull();
});

test('it skips deleted stub/full entries entirely', function () {
    $this->artisan('celestl:import-arcaea-content')->assertSuccessful();

    expect(Song::query()->where('slug', 'deletedstub')->exists())->toBeFalse();
});

test('it applies the ratingClassAlias===1 rule to force Inscribed, and pulls the constant from the raw ratingClass slot', function () {
    $this->artisan('celestl:import-arcaea-content')->assertSuccessful();

    $song = Song::query()->where('slug', 'testsong')->with('charts')->sole();
    $ins = $song->charts->firstWhere('difficulty', Difficulty::Inscribed);

    expect($ins)->not->toBeNull()
        ->and($ins->level)->toBe('11')
        ->and((float) $ins->constant)->toBe(11.3)
        ->and($song->charts->pluck('difficulty')->contains(Difficulty::Beyond))->toBeFalse();
});

test('it imports special songs (April Fools "?" rating, and the tutorial song) bucketed into the synthetic April Fools pack', function () {
    $this->artisan('celestl:import-arcaea-content')->assertSuccessful();

    $aprilFoolsPack = Pack::query()->where('slug', 'aprilfools')->sole();
    $joke = Song::query()->where('slug', 'aprilfoolssong')->with('charts')->sole();
    $tutorial = Song::query()->where('slug', 'tutorialsong')->with('charts')->sole();

    expect($joke->pack_id)->toBe($aprilFoolsPack->id)
        ->and($joke->charts->first()->level)->toBe('?')
        ->and($joke->charts->first()->constant)->toBeNull()
        ->and($tutorial->pack_id)->toBe($aprilFoolsPack->id)
        ->and($tutorial->charts->firstWhere('difficulty', Difficulty::Past)->level)->toBe('1')
        // No notecount.json entry for this song — must fall back to the inline `difficulties[].notes`.
        ->and($tutorial->charts->firstWhere('difficulty', Difficulty::Past)->note_count)->toBe(173);
});

test('it is idempotent: re-running does not create duplicates', function () {
    $this->artisan('celestl:import-arcaea-content')->assertSuccessful();
    $this->artisan('celestl:import-arcaea-content')->assertSuccessful();

    expect(Song::query()->where('slug', 'testsong')->count())->toBe(1)
        ->and(Chart::query()->where('song_id', Song::where('slug', 'testsong')->value('id'))->count())->toBe(4);
});
