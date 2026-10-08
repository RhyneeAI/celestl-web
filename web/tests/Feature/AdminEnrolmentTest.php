<?php

use App\Models\AdminAccount;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use PragmaRX\Google2FA\Google2FA;

uses(RefreshDatabase::class);

test('it enrols an email and stores an unconfirmed secret', function () {
    $this->artisan('celestl:admin-totp', ['--email' => 'owner@example.test'])
        ->assertSuccessful();

    $account = AdminAccount::current();

    expect($account->email)->toBe('owner@example.test')
        ->and($account->totp_secret)->not->toBeEmpty()
        // Scanning a QR proves nothing; only a code coming back does.
        ->and($account->confirmed_at)->toBeNull();
});

test('the secret it prints is the one that actually works', function () {
    $this->artisan('celestl:admin-totp', ['--email' => 'owner@example.test'])->assertSuccessful();

    $code = (new Google2FA)->getCurrentOtp(AdminAccount::current()->totp_secret);

    $this->post('/admin/login', ['code' => $code])->assertRedirect(route('admin.home'));
});

test('it refuses to re-enrol once a code has confirmed the admin', function () {
    $this->artisan('celestl:admin-totp', ['--email' => 'owner@example.test'])->assertSuccessful();
    $secret = AdminAccount::current()->totp_secret;
    $this->post('/admin/login', ['code' => (new Google2FA)->getCurrentOtp($secret)]);

    $this->artisan('celestl:admin-totp', ['--email' => 'someone@example.test'])
        ->expectsOutputToContain('already claimed by owner@example.test')
        ->assertFailed();

    expect(AdminAccount::current()->email)->toBe('owner@example.test')
        ->and(AdminAccount::current()->totp_secret)->toBe($secret);
});

test('clearing the email lets a new admin enrol', function () {
    $this->artisan('celestl:admin-totp', ['--email' => 'owner@example.test'])->assertSuccessful();
    $this->post('/admin/login', ['code' => (new Google2FA)->getCurrentOtp(AdminAccount::current()->totp_secret)]);

    AdminAccount::current()->update(['email' => null]);

    $this->artisan('celestl:admin-totp', ['--email' => 'next@example.test'])
        ->expectsConfirmation('Replace the unconfirmed enrolment for ?', 'yes')
        ->assertSuccessful();

    expect(AdminAccount::current()->email)->toBe('next@example.test')
        ->and(AdminAccount::current()->confirmed_at)->toBeNull();
});

test('an unconfirmed enrolment can still be replaced', function () {
    $this->artisan('celestl:admin-totp', ['--email' => 'typo@example.test'])->assertSuccessful();

    $this->artisan('celestl:admin-totp', ['--email' => 'owner@example.test'])
        ->expectsConfirmation('Replace the unconfirmed enrolment for typo@example.test?', 'yes')
        ->assertSuccessful();

    expect(AdminAccount::current()->email)->toBe('owner@example.test');
});

test('it rejects a value that is not an email address', function () {
    $this->artisan('celestl:admin-totp', ['--email' => 'not-an-email'])->assertFailed();

    expect(AdminAccount::current())->toBeNull();
});

test('the secret is not readable in the database without the app key', function () {
    $this->artisan('celestl:admin-totp', ['--email' => 'owner@example.test'])->assertSuccessful();

    $plain = AdminAccount::current()->totp_secret;
    $stored = DB::table('admin_accounts')->value('totp_secret');

    // What a database dump would show: ciphertext, not the secret itself.
    expect($stored)->not->toBe($plain)
        ->and($stored)->not->toContain($plain)
        ->and(Crypt::decryptString($stored))->toBe($plain);
});
