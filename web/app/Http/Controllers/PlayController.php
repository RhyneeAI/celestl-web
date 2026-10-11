<?php

namespace App\Http\Controllers;

use App\Lamp;
use App\Models\Chart;
use App\Models\Play;
use App\PlaySource;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Logged plays for a signed-in account.
 *
 * Guests keep their history in their own browser instead (CLAUDE.md § Kalkulator); nothing here is
 * reachable without an account, so there is no anonymous write path to worry about.
 */
class PlayController extends Controller
{
    /** Above a perfect score only by the small margin Arcaea's overflow allows. */
    private const MAX_SCORE = 10_010_000;

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->rules());

        Play::query()->create([
            'user_id' => Auth::id(),
            'chart_id' => $this->chart($validated['slug'], $validated['difficulty'])->id,
            'score' => $validated['score'],
            'lamp' => $validated['lamp'],
            'source' => PlaySource::Manual,
            'played_at' => now(),
        ]);

        return back();
    }

    public function destroy(Play $play): RedirectResponse
    {
        // Scoped to the signed-in account, so one person cannot delete another's history by id.
        abort_unless($play->user_id === Auth::id(), 404);

        $play->delete();

        return back();
    }

    /**
     * Adopt the calculations a guest built up in their browser.
     *
     * The payload comes from localStorage, which anyone can edit, so every row is validated and
     * re-looked-up rather than trusted. Rows naming a chart that does not exist are skipped rather
     * than failing the whole import -- a stale entry should not block the rest.
     */
    public function import(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'plays' => ['required', 'array', 'max:500'],
            'plays.*.slug' => ['required', 'string'],
            'plays.*.difficulty' => ['required', 'string'],
            'plays.*.score' => ['required', 'integer', 'min:0', 'max:'.self::MAX_SCORE],
            'plays.*.lamp' => ['required', Rule::enum(Lamp::class)],
            'plays.*.playedAt' => ['nullable', 'date'],
        ]);

        $imported = 0;

        foreach ($validated['plays'] as $entry) {
            $chart = Chart::query()
                ->whereRelation('song', 'slug', $entry['slug'])
                ->where('difficulty', $entry['difficulty'])
                ->first();

            if ($chart === null) {
                continue;
            }

            Play::query()->create([
                'user_id' => Auth::id(),
                'chart_id' => $chart->id,
                'score' => $entry['score'],
                'lamp' => $entry['lamp'],
                'source' => PlaySource::Manual,
                // Keep when it was actually calculated, so an import does not look like a burst
                // of plays all made at the moment of signing in.
                'played_at' => $entry['playedAt'] ?? now(),
            ]);

            $imported++;
        }

        return back()->with('imported', $imported);
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(): array
    {
        return [
            'slug' => ['required', 'string'],
            'difficulty' => ['required', 'string'],
            'score' => ['required', 'integer', 'min:0', 'max:'.self::MAX_SCORE],
            'lamp' => ['required', Rule::enum(Lamp::class)],
        ];
    }

    private function chart(string $slug, string $difficulty): Chart
    {
        $chart = Chart::query()
            ->whereRelation('song', 'slug', $slug)
            ->where('difficulty', $difficulty)
            ->first();

        if ($chart === null) {
            throw ValidationException::withMessages([
                'slug' => 'That song and difficulty do not exist.',
            ]);
        }

        return $chart;
    }
}
