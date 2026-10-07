<?php

namespace App\Services;

use App\Grade;
use App\Lamp;

/**
 * Arcaea play rating, per chart. Pure: no database, no models.
 *
 * Every rule here comes from the owner (CLAUDE.md § Aturan rating Arcaea) — not a wiki, not
 * inferred from screenshots. Don't change any constant in this file without updating CLAUDE.md
 * and the test values together.
 *
 * Total PTT is deliberately absent: its formula is still unverified (CLAUDE.md § Potential total),
 * so this service only answers "what is this one play worth".
 */
class ArcaeaRating
{
    /** Every clear lamp is worth the same bonus; Lost is worth nothing. */
    private const CLEAR_BONUS = 0.2;

    /**
     * Score component of a play rating, before the chart constant and the clear bonus.
     *
     * Can be negative (a bad score drags the rating below the chart constant) — the floor is
     * applied in playRating(), not here, because the bonus must survive that floor.
     */
    public function modifier(int $score): float
    {
        if ($score >= 10_000_000) {
            return 2.0;
        }

        if ($score >= 9_800_000) {
            return 1.0 + ($score - 9_800_000) / 200_000;
        }

        return ($score - 9_500_000) / 300_000;
    }

    /**
     * max(0, constant + modifier) + bonus.
     *
     * The floor is applied *before* the bonus, so a chart floored to 0 still earns +0.2 when
     * cleared — owner's rule, and the reason this isn't a single max() around the whole sum.
     */
    public function playRating(float $constant, int $score, Lamp $lamp): float
    {
        $base = max(0.0, $constant + $this->modifier($score));

        return $base + ($lamp->isClear() ? self::CLEAR_BONUS : 0.0);
    }

    /**
     * Grade is derived from score alone — a perfect score is still EX+, since PM is a lamp.
     */
    public function grade(int $score): Grade
    {
        return match (true) {
            $score >= 9_900_000 => Grade::EXPlus,
            $score >= 9_800_000 => Grade::EX,
            $score >= 9_500_000 => Grade::AA,
            $score >= 9_200_000 => Grade::A,
            $score >= 9_000_000 => Grade::B,
            $score >= 8_800_000 => Grade::C,
            default => Grade::D,
        };
    }
}
