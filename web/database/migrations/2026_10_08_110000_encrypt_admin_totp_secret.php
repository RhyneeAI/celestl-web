<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Store the admin's TOTP secret encrypted at rest, with Laravel's `encrypted` cast.
 *
 * TOTP is symmetric: the server has to know the secret to check a code, so this cannot protect
 * against someone who already controls the running app. What it does cover is the realistic case
 * of a database copy on its own -- a dump, a backup, a `SELECT` from another tool -- which without
 * APP_KEY is now useless for minting codes.
 *
 * Widened to text because the ciphertext is ~256 characters for a 32-character secret, just past
 * what the default string column holds.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('admin_accounts', function (Blueprint $table) {
            $table->text('totp_secret')->change();
        });
    }

    public function down(): void
    {
        Schema::table('admin_accounts', function (Blueprint $table) {
            $table->string('totp_secret')->change();
        });
    }
};
