<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __invoke(): Response
    {
        /** @var User $user */
        $user = Auth::user();
        $user->load('gameIdentities.game');

        $identity = $user->identityFor('arcaea');

        return Inertia::render('account/profile', [
            'identity' => $identity === null ? null : [
                'nickname' => $identity->display_name,
                'player_id' => $identity->formattedIdentifier(),
            ],
            'member_since' => $user->created_at?->toDateString(),
        ]);
    }
}
