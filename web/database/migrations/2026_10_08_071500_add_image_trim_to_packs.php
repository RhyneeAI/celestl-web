<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Size of a pack image's non-transparent content, used as the pack card's aspect ratio.
 *
 * The owner decided this for the mockup and it carries over: the card keeps a fixed width and lets
 * its height follow the artwork, instead of cropping every pack into one box (CLAUDE.md § tinggi
 * kartu Pack). It is the *trimmed* size, not the canvas: a couple of files (extend_2, extend_3)
 * carry ~48px of unused transparent margin from their vector export, and using the canvas there
 * would leave those cards looking short of content next to the rest.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('packs', function (Blueprint $table) {
            $table->unsignedInteger('image_trim_width')->nullable()->after('image_thumb_path');
            $table->unsignedInteger('image_trim_height')->nullable()->after('image_trim_width');
        });
    }

    public function down(): void
    {
        Schema::table('packs', function (Blueprint $table) {
            $table->dropColumn(['image_trim_width', 'image_trim_height']);
        });
    }
};
