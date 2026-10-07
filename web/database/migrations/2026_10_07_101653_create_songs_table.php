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
        Schema::create('songs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->constrained()->cascadeOnDelete();
            $table->foreignId('pack_id')->nullable()->constrained()->nullOnDelete();
            $table->string('slug');
            $table->string('title');
            $table->json('title_localized')->nullable();
            $table->string('artist')->nullable();
            // Beda dari `artist` (bisa kolaborasi vokal/alias) — belum ada sumber massal, selalu null untuk sekarang.
            $table->string('composer')->nullable();
            // Belum ada sumber massal per-lagu (ada per-chart lewat `jacketDesigner` di charts).
            $table->string('jacket_designer')->nullable();
            // Light/Conflict/Colorless/Lephon/Catastrophe — khusus Arcaea, lihat CLAUDE.md § Field side.
            $table->string('side')->nullable();
            // String apa adanya dari songlist.json ("180-300"), bukan numerik — ada lagu dengan rentang BPM.
            $table->string('bpm')->nullable();
            // "m:ss", dari data/songlength.json (543/553 lagu, sisanya belum ada sumbernya).
            $table->string('length')->nullable();
            $table->string('version')->nullable();
            $table->date('released_at')->nullable();
            // Perceptual hash untuk pencocokan jacket Best 50 (Fase 3) — belum dipakai.
            $table->string('jacket_hash')->nullable();
            $table->timestamps();

            $table->unique(['game_id', 'slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('songs');
    }
};
