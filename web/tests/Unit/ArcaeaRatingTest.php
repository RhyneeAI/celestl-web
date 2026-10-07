<?php

use App\Grade;
use App\Lamp;
use App\Services\ArcaeaRating;

/**
 * Every expected value here comes from the owner (CLAUDE.md § Aturan rating Arcaea) — not from a
 * wiki, and not inferred from screenshots. The one real-game data point (Extradimensional) is
 * cross-validation, not the source of the formula.
 */
beforeEach(function () {
    $this->rating = new ArcaeaRating;
});

describe('modifier', function () {
    test('is a flat 2.0 at and above a perfect score', function () {
        expect($this->rating->modifier(10_000_000))->toBe(2.0)
            ->and($this->rating->modifier(10_001_000))->toBe(2.0);
    });

    test('scales from 1.0 to 2.0 between 9.8M and 10M', function () {
        expect($this->rating->modifier(9_800_000))->toBe(1.0)
            ->and($this->rating->modifier(9_900_000))->toBe(1.5)
            ->and($this->rating->modifier(9_999_999))->toEqualWithDelta(2.0, 1e-5);
    });

    test('scales from 0 upward starting at 9.5M below 9.8M', function () {
        expect($this->rating->modifier(9_500_000))->toBe(0.0)
            ->and($this->rating->modifier(9_700_000))->toEqualWithDelta(0.666667, 1e-6);
    });

    test('goes negative below 9.5M', function () {
        expect($this->rating->modifier(9_200_000))->toEqualWithDelta(-1.0, 1e-9)
            ->and($this->rating->modifier(0))->toBeLessThan(0);
    });
});

describe('playRating — nilai uji wajib dari CLAUDE.md', function () {
    // Base formula tests: constant 10.4, bonus = 0 (Lost), unless stated otherwise.
    test('matches every required test value', function (int $score, float $constant, float $expected) {
        expect($this->rating->playRating($constant, $score, Lamp::Lost))
            ->toEqualWithDelta($expected, 1e-6);
    })->with([
        'perfect score' => [10_000_000, 10.4, 12.4],
        '9.912.345' => [9_912_345, 10.4, 11.961725],
        'batas 9.8M' => [9_800_000, 10.4, 11.4],
        '9.7M' => [9_700_000, 10.4, 11.066667],
        'batas 9.5M' => [9_500_000, 10.4, 10.4],
        '9.2M' => [9_200_000, 10.4, 9.4],
        'clamp minimum nol' => [9_000_000, 1.5, 0.0],
    ]);

    test('matches the real in-game example (Extradimensional, clear)', function () {
        expect($this->rating->playRating(11.3, 9_900_167, Lamp::NormalClear))
            ->toEqualWithDelta(13.000835, 1e-6);
    });
});

describe('bonus clear', function () {
    test('adds exactly +0.2 for every clear lamp', function (Lamp $lamp) {
        expect($this->rating->playRating(10.4, 9_500_000, $lamp))
            ->toEqualWithDelta(10.6, 1e-9);
    })->with([
        Lamp::EasyClear,
        Lamp::NormalClear,
        Lamp::HardClear,
        Lamp::FullRecall,
        Lamp::PureMemory,
    ]);

    test('adds nothing for Lost', function () {
        expect($this->rating->playRating(10.4, 9_500_000, Lamp::Lost))
            ->toEqualWithDelta(10.4, 1e-9);
    });

    test('is applied AFTER the zero clamp, so a clamped chart still gets it', function () {
        // CLAUDE.md: max(0, constant + modifier) + bonus_clear
        expect($this->rating->playRating(1.5, 9_000_000, Lamp::HardClear))
            ->toEqualWithDelta(0.2, 1e-9)
            ->and($this->rating->playRating(1.5, 9_000_000, Lamp::Lost))
            ->toEqualWithDelta(0.0, 1e-9);
    });

    test('never returns a negative rating', function () {
        expect($this->rating->playRating(1.0, 0, Lamp::Lost))->toBe(0.0);
    });
});

describe('grade', function () {
    test('maps score to grade', function (int $score, Grade $expected) {
        expect($this->rating->grade($score))->toBe($expected);
    })->with([
        'D bawah' => [0, Grade::D],
        'D atas' => [8_799_999, Grade::D],
        'C bawah' => [8_800_000, Grade::C],
        'C atas' => [8_999_999, Grade::C],
        'B bawah' => [9_000_000, Grade::B],
        'B atas' => [9_199_999, Grade::B],
        'A bawah' => [9_200_000, Grade::A],
        'A atas' => [9_499_999, Grade::A],
        'AA bawah' => [9_500_000, Grade::AA],
        'AA atas' => [9_799_999, Grade::AA],
        'EX bawah' => [9_800_000, Grade::EX],
        'EX atas' => [9_899_999, Grade::EX],
        'EX+ bawah' => [9_900_000, Grade::EXPlus],
    ]);

    test('a perfect score is still EX+, because PM is a lamp and not a grade', function () {
        expect($this->rating->grade(10_000_000))->toBe(Grade::EXPlus);
    });
});
