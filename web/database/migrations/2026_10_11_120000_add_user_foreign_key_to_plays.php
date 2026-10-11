<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Now that `users` has its final shape, give `plays.user_id` the constraint it was denied.
 *
 * The original migration left it unconstrained on purpose: `users` was still the starter kit's
 * table and Fase 4 was going to reshape it, so pointing a foreign key at it would have frozen a
 * decision nobody had made. That reshape has happened.
 *
 * Found by deleting a test account and watching its plays survive it. Cascading rather than
 * nulling: deleting an account should take its history with it, not leave a pile of ownerless
 * rows that nothing can reach but that still hold what someone asked to be rid of. Doing it with a
 * constraint rather than a model event means it holds for a raw DELETE too.
 *
 * Still nullable: nothing writes a null today, but a play that predates its owner is a shape the
 * column was chosen to allow (CLAUDE.md § Kalkulator).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('plays', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('plays', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });
    }
};
