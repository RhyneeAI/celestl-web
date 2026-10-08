<?php

namespace App\Console\Commands;

use App\Services\AdminTotp;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('celestl:admin-totp {--account=admin : Label shown in the authenticator app}')]
#[Description('Generate the admin TOTP secret to scan into Google Authenticator')]
class SetUpAdminTotp extends Command
{
    public function handle(AdminTotp $totp): int
    {
        if ($totp->isConfigured() && ! $this->confirm('ADMIN_TOTP_SECRET is already set. Replace it? The old code stops working.', false)) {
            return self::SUCCESS;
        }

        $secret = $totp->generateSecret();
        $account = (string) $this->option('account');

        $this->newLine();
        $this->line('Add this to <options=bold>web/.env</> (it is gitignored, keep it there):');
        $this->newLine();
        $this->line("  <fg=green>ADMIN_TOTP_SECRET={$secret}</>");
        $this->newLine();
        $this->line('Then in Google Authenticator: "+" -> "Enter a setup key", and type the secret above.');
        $this->newLine();
        $this->line('Or turn this into a QR with any generator and scan it instead:');
        $this->line('  <fg=gray>'.$totp->setupUri($secret, $account).'</>');
        $this->newLine();
        // Said plainly because this is the one moment the secret is readable, and a secret left in
        // terminal scrollback is a secret in the clear.
        $this->warn('Anyone with this secret can generate valid admin codes. Do not commit it or paste it anywhere.');

        return self::SUCCESS;
    }
}
