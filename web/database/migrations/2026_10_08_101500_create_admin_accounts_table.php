<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The single admin of this install.
 *
 * The owner's rule: once an email is recorded and its authenticator code has verified once, the
 * enrolment is fixed. Changing it means clearing the email column by hand in the database -- a
 * deliberate act at the console, not something a session can do.
 *
 * Separate from `users` on purpose. That table is for players (Fase 4, with game_identities) and
 * does not exist in any settled shape yet; the admin gate should not be waiting on it, and a player
 * row should never be one flag away from being an admin.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_accounts', function (Blueprint $table) {
            $table->id();

            // Who claimed this install. Nullable because clearing it is how the owner re-enrolls.
            $table->string('email')->nullable()->unique();

            // Shared TOTP secret. Anyone holding it can mint valid codes, so it never leaves the
            // server except once, in the setup command's QR.
            $table->string('totp_secret');

            // Set the first time a code verifies. Until then the enrolment is still replaceable.
            $table->timestamp('confirmed_at')->nullable();

            // "Only one admin" as a database constraint rather than a convention: a second row
            // cannot be inserted, whatever the application code believes.
            $table->boolean('singleton')->default(true)->unique();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_accounts');
    }
};
