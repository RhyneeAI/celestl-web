<?php

namespace App\Services;

use App\Models\AdminAccount;
use PragmaRX\Google2FA\Google2FA;

/**
 * Time-based one-time passwords for the admin gate (RFC 6238), the codes Google Authenticator and
 * any compatible app generates.
 *
 * Chosen over a password because the project is passwordless by design (CLAUDE.md § Akun), and
 * over "Sign in with Google" because TOTP needs no OAuth client, no internet at sign-in time, and
 * no third party to be reachable for the owner to get into their own admin panel.
 *
 * The enrolment lives in the `admin_accounts` row rather than .env, so that "this install belongs
 * to one person" is recorded data with a lock on it, not a value anyone editing a file can swap.
 */
class AdminTotp
{
    public function __construct(private readonly Google2FA $google2fa) {}

    public function isConfigured(): bool
    {
        return AdminAccount::current() !== null;
    }

    public function generateSecret(): string
    {
        return $this->google2fa->generateSecretKey();
    }

    /**
     * The otpauth:// URI an authenticator app reads from a QR code.
     */
    public function setupUri(string $secret, string $account): string
    {
        return $this->google2fa->getQRCodeUrl(config('app.name'), $account, $secret);
    }

    /**
     * Is this the code the enrolled secret produces right now?
     *
     * The first code that verifies also confirms the enrolment, which is what closes it to further
     * changes -- see AdminAccount::isLocked(). Scanning a QR proves nothing on its own; a code
     * coming back proves the owner really has the secret in their app.
     *
     * The one-step window either side absorbs clock drift between this machine and the phone;
     * without it a watch that is a few seconds out would reject every code.
     */
    public function verify(string $code): bool
    {
        $account = AdminAccount::current();

        if ($account === null) {
            return false;
        }

        // Non-digits are stripped so a code pasted as "123 456" still works.
        $code = preg_replace('/\D/', '', $code) ?? '';

        if (! $this->google2fa->verifyKey($account->totp_secret, $code, window: 1)) {
            return false;
        }

        if ($account->confirmed_at === null) {
            $account->update(['confirmed_at' => now()]);
        }

        return true;
    }
}
