<?php

namespace App\Models;

use Database\Factories\PackFactory;
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
 * @property int|null $parent_id
 * @property string $slug
 * @property string $name
 * @property string|null $section
 * @property bool $small_pack_image
 * @property string|null $image_path
 * @property string|null $image_thumb_path
 * @property int|null $image_trim_width
 * @property int|null $image_trim_height
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['game_id', 'parent_id', 'slug', 'name', 'section', 'small_pack_image', 'image_path', 'image_thumb_path',
    'image_trim_width', 'image_trim_height'])]
class Pack extends Model
{
    /** @use HasFactory<PackFactory> */
    use HasFactory;

    /**
     * Display order of the section ribbons, mirroring arcaea.miraheze.org/wiki/Pack_list's layout
     * (its structure only, not its color theme -- see CLAUDE.md § Mockup buatan sendiri).
     *
     * Sections are stored as these display labels already (the importer maps packlist.json's raw
     * codes), so this is purely an ordering, and 'Other' is the bucket for synthetic packs.
     */
    public const SECTION_ORDER = [
        'Arcaea', 'Main Story · Act I', 'Main Story · Act II', 'Side Story',
        'Collaboration', 'Variety', 'Other',
    ];

    protected function casts(): array
    {
        return [
            'small_pack_image' => 'boolean',
        ];
    }

    /**
     * Public URL of this pack's art, or null when this install has no art for it.
     * Chapter/append packs are given their parent's file by the importer, so they resolve too.
     */
    public function imageUrl(bool $thumb = false): ?string
    {
        $path = $thumb ? $this->image_thumb_path : $this->image_path;

        if (! $path) {
            return null;
        }

        // Path only, not the absolute URL the disk builds from APP_URL: the app gets opened from
        // other hosts too (a phone on the LAN), and a baked-in localhost would break every image.
        return parse_url(Storage::disk('public')->url($path), PHP_URL_PATH);
    }

    /**
     * The card's aspect ratio as "width/height", or null to let the UI pick its default.
     *
     * Taken from the artwork's own proportions so a tall pack banner is not cropped into a
     * landscape box -- the owner's decision, see the migration that added these columns.
     */
    public function imageAspectRatio(): ?string
    {
        if (! $this->image_trim_width || ! $this->image_trim_height) {
            return null;
        }

        return "{$this->image_trim_width}/{$this->image_trim_height}";
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
