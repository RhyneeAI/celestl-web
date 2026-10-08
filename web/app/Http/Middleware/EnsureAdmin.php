<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Gate for every /admin route.
 *
 * Celestl has no accounts yet (Fase 4), and the owner is the only admin, so this is deliberately
 * not a user system: it checks one flag that AdminAuthController sets after a valid TOTP code.
 *
 * When no secret is configured the gate stays shut rather than opening. An admin panel that is
 * reachable because its credential is missing is the wrong way round.
 */
class EnsureAdmin
{
    public const SESSION_KEY = 'admin_authenticated_at';

    public function handle(Request $request, Closure $next): Response
    {
        if ($request->session()->has(self::SESSION_KEY)) {
            return $next($request);
        }

        return redirect()->route('admin.login');
    }
}
