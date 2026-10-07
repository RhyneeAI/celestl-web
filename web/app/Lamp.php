<?php

namespace App;

/**
 * Clear lamp, separate from grade (which is derived from score alone) — see CLAUDE.md
 * § Grade dan lamp.
 */
enum Lamp: string
{
    case Lost = 'lost';
    case EasyClear = 'easy_clear';
    case NormalClear = 'normal_clear';
    case HardClear = 'hard_clear';
    case FullRecall = 'full_recall';
    case PureMemory = 'pure_memory';

    /**
     * Every lamp except Lost counts as a clear, and they all give the same +0.2 bonus
     * (owner's rule, CLAUDE.md § Aturan rating Arcaea).
     */
    public function isClear(): bool
    {
        return $this !== self::Lost;
    }

    /**
     * Private server's `clear_type` int (core/score.py) -> lamp. Used by the Unofficial segment;
     * the OCR path reads lamps off the Best 50 image instead.
     */
    public static function fromPrivateServerClearType(int $clearType): self
    {
        return match ($clearType) {
            0 => self::Lost,
            1 => self::NormalClear,
            2 => self::FullRecall,
            3 => self::PureMemory,
            4 => self::EasyClear,
            5 => self::HardClear,
            default => throw new \ValueError("Unknown clear_type: {$clearType}"),
        };
    }
}
