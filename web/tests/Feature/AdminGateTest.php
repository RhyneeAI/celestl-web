<?php

use App\Http\Middleware\EnsureAdmin;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use PragmaRX\Google2FA\Google2FA;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->google2fa = new Google2FA;
    $this->secret = $this->google2fa->generateSecretKey();
    config(['celestl.admin.totp_secret' => $this->secret]);
    RateLimiter::clear('');
});

function currentCode(): string
{
    return test()->google2fa->getCurrentOtp(test()->secret);
}

test('every admin page redirects to sign in when not authenticated', function (string $path) {
    $this->get($path)->assertRedirect(route('admin.login'));
})->with([
    '/admin',
    '/admin/packs',
    '/admin/songs',
    '/admin/unofficial',
    '/admin/users',
    '/admin/log',
]);

test('admin write endpoints are gated too, not just the pages', function () {
    // A gate that only covers GET would leave the mutating routes wide open.
    $this->post('/admin/unofficial/songs', ['slug' => 'x', 'title' => 'X'])
        ->assertRedirect(route('admin.login'));
});

test('a valid code signs in and reaches the dashboard', function () {
    $this->post('/admin/login', ['code' => currentCode()])
        ->assertRedirect(route('admin.home'));

    expect(session()->has(EnsureAdmin::SESSION_KEY))->toBeTrue();

    $this->get('/admin')->assertOk();
});

test('a code with spaces in it still works', function () {
    $code = currentCode();
    $spaced = substr($code, 0, 3).' '.substr($code, 3);

    $this->post('/admin/login', ['code' => $spaced])->assertRedirect(route('admin.home'));
});

test('a wrong code is rejected and does not sign in', function () {
    $this->from(route('admin.login'))
        ->post('/admin/login', ['code' => '000000'])
        ->assertSessionHasErrors('code');

    expect(session()->has(EnsureAdmin::SESSION_KEY))->toBeFalse();
    $this->get('/admin')->assertRedirect(route('admin.login'));
});

test('no code is ever valid when no secret is configured', function () {
    // The gate must fail shut: a missing credential is not a reason to let anyone in.
    config(['celestl.admin.totp_secret' => null]);

    $this->post('/admin/login', ['code' => currentCode()])->assertSessionHasErrors('code');
    $this->get('/admin')->assertRedirect(route('admin.login'));
});

test('the sign in page says so when no secret is configured', function () {
    config(['celestl.admin.totp_secret' => null]);

    $this->get('/admin/login')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/login')->where('configured', false));
});

test('guessing is rate limited', function () {
    // Six digits plus a tolerance window is guessable given unlimited attempts.
    for ($attempt = 0; $attempt < 5; $attempt++) {
        $this->post('/admin/login', ['code' => '000000']);
    }

    $this->post('/admin/login', ['code' => '000000'])->assertStatus(429);
});

test('signing in rotates the session id', function () {
    $this->get('/admin/login');
    $before = session()->getId();

    $this->post('/admin/login', ['code' => currentCode()]);

    expect(session()->getId())->not->toBe($before);
});

test('signing out closes the gate again', function () {
    $this->post('/admin/login', ['code' => currentCode()]);
    $this->get('/admin')->assertOk();

    $this->post('/admin/logout')->assertRedirect(route('admin.login'));
    $this->get('/admin')->assertRedirect(route('admin.login'));
});

test('an authenticated admin visiting the sign in page is sent to the dashboard', function () {
    $this->post('/admin/login', ['code' => currentCode()]);

    $this->get('/admin/login')->assertRedirect(route('admin.home'));
});

test('the public pages are not behind the gate', function () {
    $this->get('/')->assertOk();
    $this->get('/packs')->assertOk();
});
