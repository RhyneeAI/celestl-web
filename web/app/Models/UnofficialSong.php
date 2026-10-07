<?php

namespace App\Models;

use Database\Factories\UnofficialSongFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * A custom/fan-made song for the "Unofficial" segment (private server), completely separate from
 * the official Arcaea catalog in Song/Chart — see CLAUDE.md § Unofficial.
 *
 * @property int $id
 * @property string $slug
 * @property string $title
 * @property string|null $artist
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['slug', 'title', 'artist'])]
class UnofficialSong extends Model
{
    /** @use HasFactory<UnofficialSongFactory> */
    use HasFactory;

    /**
     * @return HasMany<UnofficialChart, $this>
     */
    public function charts(): HasMany
    {
        return $this->hasMany(UnofficialChart::class);
    }
}
