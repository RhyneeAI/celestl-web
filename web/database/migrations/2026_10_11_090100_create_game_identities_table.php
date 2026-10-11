<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Who an account is inside a particular game.
 *
 * Arcaea identifies a player by a 9-digit Player ID plus a nickname they can change at will; other
 * games will use other shapes. Keeping that out of `users` means adding Rotaeno later is a new row,
 * not a migration of everyone's account (CLAUDE.md § multi-game identity). The owner chose to do
 * this now rather than retrofit it.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('game_identities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('game_id')->constrained()->cascadeOnDelete();

            // What kind of identifier this is, so a game that uses a UUID or a username does not
            // need a new column. Arcaea only ever stores 'player_id'.
            $table->string('identifier_type');

            // Normalised: Arcaea prints "160 500 737" but this stores "160500737". Grouping is a
            // display concern, and matching on the printed form would fail on a stray space.
            $table->string('identifier_value');

            // The in-game nickname. Display only, and deliberately not unique: Arcaea lets anyone
            // change theirs at any time, so two accounts can legitimately collide.
            $table->string('display_name');

            // For later: proof the player really owns this identity (a matching Best 50 upload is
            // not proof -- the image is public and editable, see CLAUDE.md § Upload Best 50).
            $table->timestamp('verified_at')->nullable();

            $table->timestamps();

            // One account per identifier per game. This is the real account key.
            $table->unique(['game_id', 'identifier_type', 'identifier_value']);

            // Sign-in by nickname scans this.
            $table->index(['game_id', 'display_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_identities');
    }
};
