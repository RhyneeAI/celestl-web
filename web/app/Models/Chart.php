<?php

namespace App\Models;

use App\Difficulty;
use Database\Factories\ChartFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $song_id
 * @property Difficulty $difficulty
 * @property string $level
 * @property string|null $constant
 * @property string|null $chart_designer
 * @property string|null $jacket_designer
 * @property int|null $note_count
 * @property string|null $game_version
 * @property string|null $source
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'song_id', 'difficulty', 'level', 'constant', 'chart_designer',
    'jacket_designer', 'note_count', 'game_version', 'source',
])]
class Chart extends Model
{
    /** @use HasFactory<ChartFactory> */
    use HasFactory;

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
