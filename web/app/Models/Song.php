<?php

namespace App\Models;

use Database\Factories\SongFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

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
 * @property string|null $jacket_path
 * @property string|null $jacket_thumb_path
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'game_id', 'pack_id', 'slug', 'title', 'title_localized', 'artist', 'composer',
    'jacket_designer', 'side', 'bpm', 'length', 'version', 'released_at', 'jacket_hash',
    'jacket_path', 'jacket_thumb_path',
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
     * Public URL of this song's jacket, or null when this install has no art for it.
     *
     * The thumbnail is for grids; the full 768x768 file is only worth loading on a detail view.
     * Callers must handle null -- a fresh clone of this repo has no art at all, by design
     * (CLAUDE.md § Data dan hak cipta).
     */
    public function jacketUrl(bool $thumb = false): ?string
    {
        $path = $thumb ? $this->jacket_thumb_path : $this->jacket_path;

        if (! $path) {
            return null;
        }

        // Path only, not the absolute URL the disk builds from APP_URL: the app gets opened from
        // other hosts too (a phone on the LAN), and a baked-in localhost would break every image.
        return parse_url(Storage::disk('public')->url($path), PHP_URL_PATH);
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
