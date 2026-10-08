<?php

namespace App\Models;

use App\Difficulty;
use Database\Factories\ChartFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property int $song_id
 * @property Difficulty $difficulty
 * @property string $level
 * @property string|null $constant
 * @property string|null $chart_designer
 * @property string|null $jacket_designer
 * @property string|null $jacket_path
 * @property string|null $jacket_thumb_path
 * @property int|null $note_count
 * @property string|null $game_version
 * @property string|null $source
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'song_id', 'difficulty', 'level', 'constant', 'chart_designer',
    'jacket_designer', 'note_count', 'game_version', 'source',
    'jacket_path', 'jacket_thumb_path',
])]
class Chart extends Model
{
    /** @use HasFactory<ChartFactory> */
    use HasFactory;

    /**
     * Public URL of this chart's own jacket, or null when it shares the song's.
     *
     * Only the 57 charts that set `jacketOverride` in songlist.json have one; everything else
     * falls back to Song::jacketUrl() at the call site.
     */
    public function jacketUrl(bool $thumb = false): ?string
    {
        $path = $thumb ? $this->jacket_thumb_path : $this->jacket_path;

        if (! $path) {
            return null;
        }

        return parse_url(Storage::disk('public')->url($path), PHP_URL_PATH);
    }

    protected function casts(): array
    {
        return [
            'difficulty' => Difficulty::class,
            'constant' => 'decimal:1',
        ];
    }

    /**
     * @return BelongsTo<Song, $this>
     */
    public function song(): BelongsTo
    {
        return $this->belongsTo(Song::class);
    }
}
