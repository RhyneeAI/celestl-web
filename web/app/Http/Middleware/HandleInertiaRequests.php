<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            // Only what the chrome needs to choose between "Sign in" and the profile link.
            // Not the User model: that would put the account id, and anything later added to the
            // table, into the HTML of every single response.
            'auth' => fn () => ($identity = $request->user()?->identityFor('arcaea')) === null
                ? null
                : ['nickname' => $identity->display_name],
            // UI strings live in lang/<locale>/app.php, never hardcoded in the React pages
            // (CLAUDE.md § Stack). The file is small enough to ship whole on every response.
            'locale' => app()->getLocale(),
            'translations' => trans('app'),
        ];
    }
}
