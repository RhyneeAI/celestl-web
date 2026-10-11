<?php

namespace App\Models;

use Database\Factories\GameIdentityFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property int $game_id
 * @property string $identifier_type
 * @property string $identifier_value
 * @property string $display_name
 * @property Carbon|null $verified_at
 */
#[Fillable(['user_id', 'game_id', 'identifier_type', 'identifier_value', 'display_name', 'verified_at'])]
class GameIdentity extends Model
{
    /** @use HasFactory<GameIdentityFactory> */
    use HasFactory;

    /** Arcaea's 9-digit Player ID. The only identifier type Celestl handles today. */
    public const TYPE_PLAYER_ID = 'player_id';

    protected function casts(): array
    {
        return [
            'verified_at' => 'datetime',
        ];
    }

    /**
     * Strip everything that is not a digit.
     *
     * Arcaea prints the Player ID grouped ("160 500 737") and people copy it that way, so the
     * stored form has to be the bare digits or the same id would fail to match itself.
     */
    public static function normalizePlayerId(string $value): string
    {
        return preg_replace('/\D/', '', $value) ?? '';
    }

    /**
     * Group the stored digits back for display: 160500737 -> "160 500 737".
     */
    public function formattedIdentifier(): string
    {
        if ($this->identifier_type !== self::TYPE_PLAYER_ID) {
            return $this->identifier_value;
        }

        return trim(chunk_split($this->identifier_value, 3, ' '));
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Game, $this>
     */
    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }
}
