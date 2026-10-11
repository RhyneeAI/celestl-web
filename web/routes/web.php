<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\CalculatorController;
use App\Http\Controllers\PackController;
use App\Http\Controllers\PlayController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SongController;
use Illuminate\Support\Facades\Route;

// The song catalogue is the landing page -- it is what the app is for, and the Figma mobile flow
// starts there (splash/character greeting is not built yet).
Route::get('/', [SongController::class, 'index'])->name('home');
Route::get('/songs/{slug}', [SongController::class, 'show'])->name('songs.show');

Route::get('/calculator', CalculatorController::class)->name('calculator');

Route::get('/packs', [PackController::class, 'index'])->name('packs.index');
Route::get('/packs/{slug}', [PackController::class, 'show'])->name('packs.show');

// Accounts (CLAUDE.md § Akun): no passwords, sign in with an in-game identity. Everything above
// stays reachable signed out -- guest mode is a requirement, not a fallback.
Route::middleware('guest')->group(function () {
    Route::get('/register', [AccountController::class, 'showRegister'])->name('register');
    Route::post('/register', [AccountController::class, 'register'])->middleware('throttle:10,1');

    Route::get('/login', [AccountController::class, 'showLogin'])->name('login');
    Route::post('/login', [AccountController::class, 'login'])->middleware('throttle:10,1');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', ProfileController::class)->name('profile');

    Route::post('/plays', [PlayController::class, 'store'])->name('plays.store');
    Route::post('/plays/import', [PlayController::class, 'import'])->name('plays.import');
    Route::delete('/plays/{play}', [PlayController::class, 'destroy'])->name('plays.destroy');
    Route::post('/logout', [AccountController::class, 'logout'])->name('logout');
});

require __DIR__.'/admin.php';
