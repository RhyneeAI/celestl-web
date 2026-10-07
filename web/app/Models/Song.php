<?php

namespace App\Models;

use Database\Factories\SongFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $game_id
 * @property int|null $pack_id
 * @property string $slug
 * @property string $title
 * @property array<string, string>|null $title_localized
 * @property string|null $artist
 * @property string|null $composer
 * @property string|null $jacket_designer
 * @property string|null $side
 * @property string|null $bpm
 * @property string|null $length
 * @property string|null $version
 * @property Carbon|null $released_at
 * @property string|null $jacket_hash
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'game_id', 'pack_id', 'slug', 'title', 'title_localized', 'artist', 'composer',
    'jacket_designer', 'side', 'bpm', 'length', 'version', 'released_at', 'jacket_hash',
])]
class Song extends Model
{
    /** @use HasFactory<SongFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'title_localized' => 'array',
            'released_at' => 'date',
        ];
    }

    /**
     * @return BelongsTo<Game, $this>
     */
    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }

    /**
     * @return BelongsTo<Pack, $this>
     */
    public function pack(): BelongsTo
    {
        return $this->belongsTo(Pack::class);
    }

    /**
     * @return HasMany<Chart, $this>
     */
    public function charts(): HasMany
    {
        return $this->hasMany(Chart::class);
    }
}
