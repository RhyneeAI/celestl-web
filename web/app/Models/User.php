<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Carbon;

/**
 * A Celestl account, and nothing more.
 *
 * No name, no email, no password: sign-in is by in-game identity (CLAUDE.md § Akun), and who this
 * account is inside a game lives on GameIdentity. Still Authenticatable so Laravel's session guard
 * works -- the password half of that contract is simply never used, because nothing ever calls
 * Auth::attempt().
 *
 * The one column left besides the id is `remember_token`, which keeps someone signed in past the
 * session lifetime -- worth more here than usual, since the alternative to a cookie is retyping a
 * 9-digit id rather than a saved password.
 *
 * @property int $id
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Hidden(['remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory;

    /**
     * @return HasMany<GameIdentity, $this>
     */
    public function gameIdentities(): HasMany
    {
        return $this->hasMany(GameIdentity::class);
    }

    /**
     * @return HasMany<Play, $this>
     */
    public function plays(): HasMany
    {
        return $this->hasMany(Play::class);
    }

    /**
     * This account's identity in one game, or null when it has none.
     */
    public function identityFor(string $gameSlug): ?GameIdentity
    {
        return $this->gameIdentities->first(
            fn (GameIdentity $identity) => $identity->game->slug === $gameSlug,
        );
    }
}
