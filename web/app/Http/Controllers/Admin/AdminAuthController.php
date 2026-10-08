<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Middleware\EnsureAdmin;
use App\Services\AdminTotp;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AdminAuthController extends Controller
{
    public function __construct(private readonly AdminTotp $totp) {}

    public function show(): Response|RedirectResponse
    {
        if (request()->session()->has(EnsureAdmin::SESSION_KEY)) {
            return redirect()->route('admin.home');
        }

        return Inertia::render('admin/login', [
            // The form is pointless before anyone enrols, so say so instead of letting codes fail.
            'enrolled' => $this->totp->isConfigured(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate(['code' => ['required', 'string']]);

        if (! $this->totp->verify($request->string('code')->toString())) {
            throw ValidationException::withMessages([
                'code' => 'That code is not valid right now.',
            ]);
        }

        // A fresh session id on sign-in, so a session id captured before this point cannot be
        // replayed as an authenticated one.
        $request->session()->regenerate();
        $request->session()->put(EnsureAdmin::SESSION_KEY, now()->toIso8601String());

        return redirect()->intended(route('admin.home'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->session()->forget(EnsureAdmin::SESSION_KEY);
        $request->session()->regenerate();

        return redirect()->route('admin.login');
    }
}
