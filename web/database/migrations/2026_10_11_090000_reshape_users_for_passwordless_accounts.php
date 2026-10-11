<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Strip the starter kit's columns off `users`.
 *
 * Celestl has no passwords and no email (CLAUDE.md § Akun), so those are dead weight that would
 * invite someone to wire up password auth later by accident. What is left is an account id and
 * nothing else: who the account *is* in a game lives in `game_identities`, because a player can
 * hold one identity per game and the shapes differ between games.
 *
 * `remember_token` stays. It is not password machinery -- it is what keeps someone signed in past
 * the session lifetime, and that matters more here than in a normal app: with no password, the
 * alternative is retyping a 9-digit id every couple of hours.
 *
 * Safe to do now and only now: the table is empty, so this costs no data migration. Doing it after
 * accounts exist would.
 *
 * `password_reset_tokens` is left alone -- unused, but dropping a framework table is not this
 * migration's business.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Separate statement, and first: SQLite refuses to drop a column that still has an index
        // on it, so the unique on `email` has to go before the column does. MySQL tolerates either
        // order, which is exactly why this only showed up in the test suite.
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique('users_email_unique');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['name', 'email', 'email_verified_at', 'password']);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
        });
    }
};
