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
        Schema::create('charts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('song_id')->constrained()->cascadeOnDelete();
            // String + PHP enum cast (App\Difficulty), bukan kolom enum native MySQL — lebih gampang
            // diubah nanti tanpa ALTER TABLE kalau daftar difficulty berubah.
            $table->string('difficulty');
            // String, bukan integer — level bisa "11+" (rating + ratingPlus) atau literal "?" untuk
            // lagu April Fools (lihat CLAUDE.md § songlistothers.json), jangan pernah di-parse sebagai angka.
            $table->string('level');
            $table->decimal('constant', 4, 1)->nullable();
            $table->string('chart_designer')->nullable();
            $table->string('jacket_designer')->nullable();
            $table->unsignedInteger('note_count')->nullable();
            $table->string('game_version')->nullable();
            // Sumber constant (mis. "arcaea.miraheze.org Data:ChartConstant.json") — lihat CLAUDE.md
            // § Sumber chart constant ditemukan.
            $table->string('source')->nullable();
            $table->timestamps();

            $table->unique(['song_id', 'difficulty']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('charts');
    }
};
