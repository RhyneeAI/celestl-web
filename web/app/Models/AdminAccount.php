<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string|null $email
 * @property string $totp_secret
 * @property Carbon|null $confirmed_at
 * @property bool $singleton
 */
#[Fillable(['email', 'totp_secret', 'confirmed_at'])]
#[Hidden(['totp_secret'])]
class AdminAccount extends Model
{
    protected function casts(): array
    {
        return [
            // Encrypted at rest: a database dump on its own is then useless for minting codes.
            // See the migration that widened this column for what that does and does not cover.
            'totp_secret' => 'encrypted',
            'confirmed_at' => 'datetime',
            'singleton' => 'boolean',
        ];
    }

    /**
     * The one admin row, or null when nobody has enrolled yet.
     */
    public static function current(): ?self
    {
        return static::query()->first();
    }

    /**
     * Enrolment is settled once an email is on record and a code has verified against it.
     *
     * Both halves matter: a secret that has never been used could belong to a half-finished setup,
     * and clearing the email is the documented way back out.
     */
    public function isLocked(): bool
    {
        return filled($this->email) && $this->confirmed_at !== null;
    }
}
