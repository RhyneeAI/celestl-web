import { describe, expect, test } from 'vitest';
import { formatScore, grade, modifier, playRating } from './arcaea-rating';

// The same table tests/Unit/ArcaeaRatingTest.php asserts against, from CLAUDE.md
// § Aturan rating Arcaea. If these two files ever disagree, one of them is wrong.
describe('playRating - nilai uji wajib dari CLAUDE.md', () => {
    test.each([
        ['perfect score', 10_000_000, 10.4, 12.4],
        ['9.912.345', 9_912_345, 10.4, 11.961725],
        ['batas 9.8M', 9_800_000, 10.4, 11.4],
        ['9.7M', 9_700_000, 10.4, 11.066667],
        ['batas 9.5M', 9_500_000, 10.4, 10.4],
        ['9.2M', 9_200_000, 10.4, 9.4],
        ['clamp minimum nol', 9_000_000, 1.5, 0],
    ])('%s', (_label, score, constant, expected) => {
        expect(playRating(constant, score, 'lost')).toBeCloseTo(expected, 6);
    });

    test('matches the real in-game example (Extradimensional, clear)', () => {
        expect(playRating(11.3, 9_900_167, 'normal_clear')).toBeCloseTo(13.000835, 6);
    });
});

describe('bonus clear', () => {
    test.each(['easy_clear', 'normal_clear', 'hard_clear', 'full_recall', 'pure_memory'] as const)(
        'adds exactly +0.2 for %s',
        (lamp) => {
            expect(playRating(10.4, 9_500_000, lamp)).toBeCloseTo(10.6, 9);
        },
    );

    test('adds nothing for Lost', () => {
        expect(playRating(10.4, 9_500_000, 'lost')).toBeCloseTo(10.4, 9);
    });

    test('is applied AFTER the zero clamp, so a clamped chart still gets it', () => {
        expect(playRating(1.5, 9_000_000, 'hard_clear')).toBeCloseTo(0.2, 9);
        expect(playRating(1.5, 9_000_000, 'lost')).toBeCloseTo(0, 9);
    });

    test('never returns a negative rating', () => {
        expect(playRating(1.0, 0, 'lost')).toBe(0);
    });
});

describe('modifier', () => {
    test('is a flat 2.0 at and above a perfect score', () => {
        expect(modifier(10_000_000)).toBe(2.0);
        expect(modifier(10_001_000)).toBe(2.0);
    });

    test('scales from 1.0 to 2.0 between 9.8M and 10M', () => {
        expect(modifier(9_800_000)).toBe(1.0);
        expect(modifier(9_900_000)).toBe(1.5);
    });
});

describe('grade', () => {
    test.each([
        [0, 'D'],
        [8_799_999, 'D'],
        [8_800_000, 'C'],
        [8_999_999, 'C'],
        [9_000_000, 'B'],
        [9_199_999, 'B'],
        [9_200_000, 'A'],
        [9_499_999, 'A'],
        [9_500_000, 'AA'],
        [9_799_999, 'AA'],
        [9_800_000, 'EX'],
        [9_899_999, 'EX'],
        [9_900_000, 'EX+'],
    ])('%d -> %s', (score, expected) => {
        expect(grade(score)).toBe(expected);
    });

    test('a perfect score is still EX+, because PM is a lamp and not a grade', () => {
        expect(grade(10_000_000)).toBe('EX+');
    });
});

describe('formatScore', () => {
    test('groups by three with a curly quote, padded to 8 digits', () => {
        expect(formatScore(9_998_593)).toBe('09’998’593');
        expect(formatScore(10_000_000)).toBe('10’000’000');
        expect(formatScore(0)).toBe('00’000’000');
    });
});
