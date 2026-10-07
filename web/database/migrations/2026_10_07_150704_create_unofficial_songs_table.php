<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('unofficial_songs', function (Blueprint $table) {
            $table->id();
            // ID yang akan dipakai di private server (bebas pilih, bukan dari songlist.json resmi —
            // lihat CLAUDE.md § Unofficial: katalog ini SENGAJA terpisah total dari `songs`/`charts`
            // resmi, karena isinya chart buatan sendiri/komunitas, bukan data game asli).
            $table->string('slug')->unique();
            $table->string('title');
            $table->string('artist')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('unofficial_songs');
    }
};
