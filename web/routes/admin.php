<?php

use App\Http\Controllers\Admin\AdminHomeController;
use App\Http\Controllers\Admin\AdminPackController;
use Illuminate\Support\Facades\Route;

// Route skeleton for Task 5.1/5.2 (porting design/admin-dashboard.html). Home/Packs/Songs & charts
// get real controllers as their content lands (DB-backed, see CLAUDE.md); the rest stay on this
// Route::inertia() shorthand with static example data passed as page props later, matching the
// mockup's own "contoh" status for those pages — no real system (accounts/CSV import/vision) exists
// for them yet.
Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/', AdminHomeController::class)->name('home');
    Route::get('/packs', AdminPackController::class)->name('packs');
    Route::inertia('/songs', 'admin/songs')->name('songs');
    Route::inertia('/users', 'admin/users')->name('users');
    Route::inertia('/games', 'admin/games')->name('games');
    Route::inertia('/log', 'admin/log')->name('log');
    Route::inertia('/import', 'admin/import')->name('import');
    Route::inertia('/testing', 'admin/testing')->name('testing');
});
