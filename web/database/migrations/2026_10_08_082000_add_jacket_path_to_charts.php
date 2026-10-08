<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A difficulty can have its own jacket art, not just its own credit.
 *
 * songlist.json marks these with `jacketOverride` on the difficulty: 57 charts across 50 songs,
 * in three shapes -- Beyond only (42 songs), Past+Present sharing one alternate (7 songs, e.g.
 * Prism and To the Furthest Dream), and one song overriding Future. Null means "use the song's
 * jacket", which is the case for every other chart.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('charts', function (Blueprint $table) {
            $table->string('jacket_path')->nullable()->after('jacket_designer');
            $table->string('jacket_thumb_path')->nullable()->after('jacket_path');
        });
    }

    public function down(): void
    {
        Schema::table('charts', function (Blueprint $table) {
            $table->dropColumn(['jacket_path', 'jacket_thumb_path']);
        });
    }
};
