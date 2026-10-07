<?php

namespace App\Models;

use Database\Factories\PackFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $game_id
 * @property int|null $parent_id
 * @property string $slug
 * @property string $name
 * @property string|null $section
 * @property bool $small_pack_image
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['game_id', 'parent_id', 'slug', 'name', 'section', 'small_pack_image'])]
class Pack extends Model
{
    /** @use HasFactory<PackFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'small_pack_image' => 'boolean',
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
     * The pack this one is a chapter/append of (e.g. "Lasting Eden Chapter 2" -> "Lasting Eden").
     *
     * @return BelongsTo<Pack, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Pack::class, 'parent_id');
    }

    /**
     * @return HasMany<Pack, $this>
     */
    public function children(): HasMany
    {
        return $this->hasMany(Pack::class, 'parent_id');
    }

    /**
     * @return HasMany<Song, $this>
     */
    public function songs(): HasMany
    {
        return $this->hasMany(Song::class);
    }
}
