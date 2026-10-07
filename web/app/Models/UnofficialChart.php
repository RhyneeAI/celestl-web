<?php

namespace App\Models;

use App\Difficulty;
use Database\Factories\UnofficialChartFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $unofficial_song_id
 * @property Difficulty $difficulty
 * @property string|null $constant
 * @property string|null $aff_original_filename
 * @property string|null $aff_storage_path
 * @property Carbon|null $pushed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'unofficial_song_id', 'difficulty', 'constant',
    'aff_original_filename', 'aff_storage_path', 'pushed_at',
])]
class UnofficialChart extends Model
{
    /** @use HasFactory<UnofficialChartFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'difficulty' => Difficulty::class,
            'constant' => 'decimal:1',
            'pushed_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<UnofficialSong, $this>
     */
    public function song(): BelongsTo
    {
        return $this->belongsTo(UnofficialSong::class, 'unofficial_song_id');
    }
}
