<?php

namespace App\Services;

use PragmaRX\Google2FA\Google2FA;

/**
 * Time-based one-time passwords for the admin gate (RFC 6238), the codes Google Authenticator and
 * any compatible app generates.
 *
 * Chosen over a password because the project is passwordless by design (CLAUDE.md § Akun), and
 * over "Sign in with Google" because TOTP needs no OAuth client, no internet at sign-in time, and
 * no third party to be reachable for the owner to get into their own admin panel.
 *
 * The secret is shared, not public: anyone holding it can generate codes. It lives in .env, which
 * is gitignored, and never reaches the browser except once in the setup command's output.
 */
class AdminTotp
{
    public function __construct(private readonly Google2FA $google2fa) {}

    public function isConfigured(): bool
    {
        return filled($this->secret());
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
     * Is this the code the configured secret produces right now?
     *
     * The one-step window either side absorbs clock drift between this machine and the phone;
     * without it a watch that is a few seconds out would reject every code.
     */
    public function verify(string $code): bool
    {
        if (! $this->isConfigured()) {
            return false;
        }

        // Non-digits are stripped so a code pasted as "123 456" still works.
        $code = preg_replace('/\D/', '', $code) ?? '';

        return $this->google2fa->verifyKey($this->secret(), $code, window: 1);
    }

    private function secret(): string
    {
        return (string) config('celestl.admin.totp_secret');
    }
}
