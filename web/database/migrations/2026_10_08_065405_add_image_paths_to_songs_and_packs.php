<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Where a song's jacket / a pack's art lives on the public disk.
 *
 * Only the path is stored, never the image bytes: the art is ~190MB of copyrighted lowiro assets
 * (CLAUDE.md § Data dan hak cipta), and a web server serves and caches files far better than MySQL
 * can serve BLOBs through PHP. The owner picked this over storing the binaries in the database.
 *
 * Null means "no art on this install" -- the UI falls back to its gradient placeholder, which is
 * also what anyone cloning this repo gets, since the files are never committed.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('songs', function (Blueprint $table) {
            $table->string('jacket_path')->nullable()->after('jacket_hash');
            $table->string('jacket_thumb_path')->nullable()->after('jacket_path');
        });

        Schema::table('packs', function (Blueprint $table) {
            $table->string('image_path')->nullable()->after('small_pack_image');
            $table->string('image_thumb_path')->nullable()->after('image_path');
        });
    }

    public function down(): void
    {
        Schema::table('songs', function (Blueprint $table) {
            $table->dropColumn(['jacket_path', 'jacket_thumb_path']);
        });

        Schema::table('packs', function (Blueprint $table) {
            $table->dropColumn(['image_path', 'image_thumb_path']);
        });
    }
};
