<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\GameIdentity;
use App\Models\User;
use App\Services\AccountLookup;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Register, sign in, sign out -- all without a password (CLAUDE.md § Akun).
 *
 * Celestl is a personal project for a handful of people, so the flow is deliberately plain. The
 * one thing it refuses to be sloppy about is a nickname matching more than one account: guessing
 * there would hand someone a stranger's history.
 */
class AccountController extends Controller
{
    public function __construct(private readonly AccountLookup $lookup) {}

    public function showRegister(): Response|RedirectResponse
    {
        return $this->redirectIfSignedIn() ?? Inertia::render('account/register');
    }

    public function register(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            // Spaces and dashes are allowed in, then stripped: people copy the id as the game
            // prints it. The length check runs on the digits, not on what they typed.
            'player_id' => ['required', 'string', function (string $attribute, mixed $value, callable $fail) {
                if (! preg_match('/^\d{9}$/', GameIdentity::normalizePlayerId((string) $value))) {
                    $fail('A Player ID is 9 digits, as shown on your Arcaea account page.');
                }
            }],
            'nickname' => ['required', 'string', 'max:64'],
        ]);

        $game = $this->game();
        $playerId = GameIdentity::normalizePlayerId($validated['player_id']);

        $taken = GameIdentity::query()
            ->where('game_id', $game->id)
            ->where('identifier_type', GameIdentity::TYPE_PLAYER_ID)
            ->where('identifier_value', $playerId)
            ->exists();

        if ($taken) {
            throw ValidationException::withMessages([
                'player_id' => 'That Player ID already has an account here. Sign in instead.',
            ]);
        }

        // One transaction: an account with no identity could never be signed into again, and
        // would silently hold the player id hostage.
        $user = DB::transaction(function () use ($game, $playerId, $validated) {
            $user = User::query()->create();

            $user->gameIdentities()->create([
                'game_id' => $game->id,
                'identifier_type' => GameIdentity::TYPE_PLAYER_ID,
                'identifier_value' => $playerId,
                'display_name' => $validated['nickname'],
            ]);

            return $user;
        });

        Auth::login($user, remember: true);
        $request->session()->regenerate();

        return redirect()->route('profile');
    }

    public function showLogin(): Response|RedirectResponse
    {
        return $this->redirectIfSignedIn() ?? Inertia::render('account/login');
    }

    public function login(Request $request): RedirectResponse
    {
        $validated = $request->validate(['identity' => ['required', 'string']]);

        $matches = $this->lookup->resolve($this->game(), $validated['identity']);

        if ($matches->isEmpty()) {
            throw ValidationException::withMessages([
                'identity' => 'No account here with that Player ID or nickname.',
            ]);
        }

        if ($matches->count() > 1) {
            // Several people can hold the same nickname, so this is a real state, not an error we
            // can prevent. Ask for the one thing that is unique.
            throw ValidationException::withMessages([
                'identity' => 'More than one account uses that nickname. Sign in with your Player ID instead.',
            ]);
        }

        Auth::login($matches->first()->user, remember: true);
        $request->session()->regenerate();

        return redirect()->intended(route('profile'));
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }

    private function redirectIfSignedIn(): ?RedirectResponse
    {
        return Auth::check() ? redirect()->route('profile') : null;
    }

    /**
     * Arcaea is the only game with accounts today; CLAUDE.md § Rencana jauh covers the rest.
     */
    private function game(): Game
    {
        return Game::query()->where('slug', 'arcaea')->firstOrFail();
    }
}
