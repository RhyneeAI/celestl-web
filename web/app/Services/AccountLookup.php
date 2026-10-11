<?php

namespace App\Services;

use App\Models\Game;
use App\Models\GameIdentity;
use Illuminate\Support\Collection;

/**
 * Resolves what someone typed into the sign-in box to an account.
 *
 * One field, two kinds of answer: a Player ID or a nickname. Celestl has no password, so this is
 * the whole of sign-in -- which is also why it must never guess. See CLAUDE.md § Akun for the
 * owner's decision to ship this open, and the warning the register page carries.
 */
class AccountLookup
{
    /**
     * Identities matching this input, in the game given.
     *
     * Returns a collection rather than one row on purpose: a nickname can legitimately match
     * several accounts, and picking the first would sign someone into a stranger's history because
     * they happened to choose the same name. The caller has to handle that.
     *
     * @return Collection<int, GameIdentity>
     */
    public function resolve(Game $game, string $input): Collection
    {
        $input = trim($input);

        if ($input === '') {
            return collect();
        }

        // All digits (however they were spaced) means they typed a Player ID. A nickname of pure
        // digits would be ambiguous, but the id is the stable key, so it wins.
        $digits = GameIdentity::normalizePlayerId($input);

        if ($digits !== '' && $digits === preg_replace('/\s|-/', '', $input)) {
            return GameIdentity::query()
                ->where('game_id', $game->id)
                ->where('identifier_type', GameIdentity::TYPE_PLAYER_ID)
                ->where('identifier_value', $digits)
                ->get();
        }

        return GameIdentity::query()
            ->where('game_id', $game->id)
            ->where('display_name', $input)
            ->get();
    }
}
