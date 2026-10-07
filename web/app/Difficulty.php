<?php

namespace App;

enum Difficulty: string
{
    case Past = 'PST';
    case Present = 'PRS';
    case Future = 'FTR';
    case Beyond = 'BYD';
    case Eternal = 'ETR';
    case Inscribed = 'INS';

    /**
     * Maps songlist.json's `ratingClass` index (0-5) to a difficulty.
     *
     * Four Divine Oblivion charts store `ratingClass: 3` (Beyond's slot) but also carry
     * `ratingClassAlias: 1`, which the owner confirmed means "this is actually Inscribed" —
     * a leftover from before Inscribed got its own ratingClass. Pass $ratingClassAlias
     * through so callers don't have to duplicate this rule — see CLAUDE.md § Data resmi.
     */
    public static function fromRatingClass(int $ratingClass, ?int $ratingClassAlias = null): self
    {
        if ($ratingClassAlias === 1) {
            return self::Inscribed;
        }

        return match ($ratingClass) {
            0 => self::Past,
            1 => self::Present,
            2 => self::Future,
            3 => self::Beyond,
            4 => self::Eternal,
            5 => self::Inscribed,
            default => throw new \ValueError("Unknown ratingClass: {$ratingClass}"),
        };
    }
}
