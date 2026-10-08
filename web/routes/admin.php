<?php

use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\AdminHomeController;
use App\Http\Controllers\Admin\AdminPackController;
use App\Http\Controllers\Admin\AdminSongController;
use App\Http\Controllers\Admin\AdminUnofficialController;
use App\Http\Middleware\EnsureAdmin;
use Illuminate\Support\Facades\Route;

// Route skeleton for Task 5.1/5.2 (porting design/admin-dashboard.html). Home/Packs/Songs & charts
// get real controllers as their content lands (DB-backed, see CLAUDE.md); the rest stay on this
// Route::inertia() shorthand with static example data passed as page props later, matching the
// mockup's own "contoh" status for those pages — no real system (accounts/CSV import/vision) exists
// for them yet.
Route::prefix('admin')->name('admin.')->group(function () {
    // Outside the gate, or there would be no way in. The throttle matters: a TOTP code is six
    // digits and stays valid for a window, so unlimited guessing would eventually land one.
    Route::get('/login', [AdminAuthController::class, 'show'])->name('login');
    Route::post('/login', [AdminAuthController::class, 'store'])
        ->middleware('throttle:5,1')
        ->name('login.store');
});

Route::prefix('admin')->name('admin.')->middleware(EnsureAdmin::class)->group(function () {
    Route::post('/logout', [AdminAuthController::class, 'destroy'])->name('logout');

    Route::get('/', AdminHomeController::class)->name('home');
    Route::get('/packs', AdminPackController::class)->name('packs');
    Route::get('/songs', AdminSongController::class)->name('songs');

    // "Unofficial" segment (private server custom charts) -- sengaja terpisah total dari
    // songs/packs/charts resmi di atas, lihat CLAUDE.md § Unofficial.
    Route::get('/unofficial', [AdminUnofficialController::class, 'index'])->name('unofficial');
    Route::post('/unofficial/songs', [AdminUnofficialController::class, 'storeSong'])->name('unofficial.songs.store');
    Route::delete('/unofficial/songs/{unofficialSong}', [AdminUnofficialController::class, 'destroySong'])->name('unofficial.songs.destroy');
    Route::post('/unofficial/songs/{unofficialSong}/push', [AdminUnofficialController::class, 'pushSong'])->name('unofficial.songs.push');
    Route::post('/unofficial/songs/{unofficialSong}/charts', [AdminUnofficialController::class, 'storeChart'])->name('unofficial.charts.store');

    Route::inertia('/users', 'admin/users')->name('users');
    Route::inertia('/games', 'admin/games')->name('games');
    Route::inertia('/log', 'admin/log')->name('log');
    Route::inertia('/import', 'admin/import')->name('import');
    Route::inertia('/testing', 'admin/testing')->name('testing');
});
