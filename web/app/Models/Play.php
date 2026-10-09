<?php

namespace App\Models;

use App\Lamp;
use App\PlaySource;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $user_id
 * @property int $chart_id
 * @property int $score
 * @property Lamp $lamp
 * @property PlaySource $source
 * @property Carbon $played_at
 */
#[Fillable(['user_id', 'chart_id', 'score', 'lamp', 'source', 'played_at'])]
class Play extends Model
{
    protected function casts(): array
    {
        return [
            'lamp' => Lamp::class,
            'source' => PlaySource::class,
            'played_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Chart, $this>
     */
    public function chart(): BelongsTo
    {
        return $this->belongsTo(Chart::class);
    }
}
