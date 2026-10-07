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
        Schema::create('unofficial_charts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('unofficial_song_id')->constrained()->cascadeOnDelete();
            // Sama seperti `charts.difficulty` (string + App\Difficulty enum cast) — tapi dicatat di
            // sini: private server dasar (Lost-MSth/Arcaea-server) skema `chart`-nya cuma punya 5 slot
            // (PST-ETR), belum ada slot INS. Dibiarkan boleh INS di sini (fleksibel buat fork yang
            // sudah dukung), batasan 5-slot itu baru relevan nanti pas push ke server, bukan di sini.
            $table->string('difficulty');
            $table->decimal('constant', 4, 1)->nullable();
            // File .aff asli — INI BUKAN aset game resmi (chart buatan sendiri/komunitas), jadi aman
            // disimpan di storage Celestl, beda dari larangan simpan jacket/aset resmi di CLAUDE.md.
            $table->string('aff_original_filename')->nullable();
            $table->string('aff_storage_path')->nullable();
            // Belum terhubung ke server beneran (itu langkah teknis berikutnya) -- kolom ini disiapkan
            // supaya nanti gampang dicatat kapan/apakah sudah di-push ke private server.
            $table->timestamp('pushed_at')->nullable();
            $table->timestamps();

            $table->unique(['unofficial_song_id', 'difficulty']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('unofficial_charts');
    }
};
