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
        Schema::create('packs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->constrained()->cascadeOnDelete();
            $table->string('slug');
            $table->string('name');
            // Nama tampilan ("Main Story · Act I" dst, lihat CLAUDE.md § Mockup), bukan kode mentah
            // packlist.json (mainstory/mainstory2/dst). null untuk pack sintetis (mis. "April Fools").
            $table->string('section')->nullable();
            $table->foreignId('parent_id')->nullable()->constrained('packs')->nullOnDelete();
            // Dari flag `small_pack_image` packlist.json — menentukan nama file wiki saat art
            // di-download manual (File:Pack small_<id>.png vs File:Pack <id>.png).
            $table->boolean('small_pack_image')->default(false);
            $table->timestamps();

            $table->unique(['game_id', 'slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('packs');
    }
};
