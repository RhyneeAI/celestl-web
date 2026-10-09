<?php

use App\Http\Controllers\CalculatorController;
use App\Http\Controllers\PackController;
use App\Http\Controllers\SongController;
use Illuminate\Support\Facades\Route;

// The song catalogue is the landing page -- it is what the app is for, and the Figma mobile flow
// starts there (splash/character greeting is not built yet).
Route::get('/', [SongController::class, 'index'])->name('home');
Route::get('/songs/{slug}', [SongController::class, 'show'])->name('songs.show');

Route::get('/calculator', CalculatorController::class)->name('calculator');

Route::get('/packs', [PackController::class, 'index'])->name('packs.index');
Route::get('/packs/{slug}', [PackController::class, 'show'])->name('packs.show');

require __DIR__.'/admin.php';
