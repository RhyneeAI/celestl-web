<?php

namespace App\Console\Commands;

use App\Models\AdminAccount;
use App\Services\AdminTotp;
use BaconQrCode\Common\ErrorCorrectionLevel;
use BaconQrCode\Encoder\Encoder;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\Console\Output\OutputInterface;

#[Signature('celestl:admin-totp {--email= : The email address that claims this install}')]
#[Description('Enrol the single admin of this install and show the QR to scan')]
class SetUpAdminTotp extends Command
{
    public function handle(AdminTotp $totp): int
    {
        $account = AdminAccount::current();

        if ($account?->isLocked()) {
            $this->error('This install is already claimed by '.$account->email.'.');
            $this->newLine();
            $this->line('That is on purpose: once a code has verified, the enrolment is fixed.');
            $this->line('To hand it to a different address, clear the email in the database first:');
            $this->newLine();
            $this->line('  <fg=gray>UPDATE admin_accounts SET email = NULL;</>');

            return self::FAILURE;
        }

        $email = (string) ($this->option('email') ?? $this->ask('Which email address claims this install?'));

        $validator = Validator::make(['email' => $email], ['email' => ['required', 'email']]);

        if ($validator->fails()) {
            $this->error($validator->errors()->first('email'));

            return self::FAILURE;
        }

        if ($account && ! $this->confirm("Replace the unconfirmed enrolment for {$account->email}?", true)) {
            return self::SUCCESS;
        }

        $secret = $totp->generateSecret();

        // Stored unconfirmed. It only locks once a code from the app verifies against it, so a
        // mistyped email or an abandoned setup can still be redone.
        AdminAccount::query()->updateOrCreate(
            ['singleton' => true],
            ['email' => $email, 'totp_secret' => $secret, 'confirmed_at' => null],
        );

        $this->newLine();
        $this->line("Enrolling <options=bold>{$email}</> as the admin of this install.");
        $this->newLine();
        $this->line('Scan this with Google Authenticator ("+" -> "Scan a QR code"):');
        $this->newLine();
        $this->renderQrCode($totp->setupUri($secret, $email));
        $this->newLine();
        $this->line('No camera? "+" -> "Enter a setup key", and type this by hand:');
        $this->line("  <fg=green>{$secret}</>");
        $this->newLine();
        $this->line('Sign in once at <options=bold>/admin/login</>. That first valid code locks the');
        $this->line('enrolment: after it, this command refuses to change the admin.');
        $this->newLine();
        // Said plainly because this is the one moment the secret is readable, and a secret left in
        // terminal scrollback is a secret in the clear.
        $this->warn('Anyone with that secret can generate valid admin codes. Do not commit it or paste it anywhere.');

        if (filled(env('ADMIN_TOTP_SECRET'))) {
            $this->newLine();
            $this->warn('ADMIN_TOTP_SECRET is still in your .env. It is no longer read -- the enrolment lives in the database now, so you can delete that line.');
        }

        return self::SUCCESS;
    }

    /**
     * Draw the otpauth:// URI as a QR code in the terminal.
     *
     * Rendered here rather than handed to an online QR generator: pasting the setup URI into
     * someone else's website would be sending them the admin credential.
     *
     * Two module rows per text line, using the upper half block. A terminal cell is about twice as
     * tall as it is wide, so half a cell per module keeps the modules square -- a stretched QR is
     * much harder for a phone to read. Colours are set explicitly instead of relying on the
     * terminal's own palette, because a QR needs dark modules on a light background and half of
     * all terminals are the other way round.
     */
    private function renderQrCode(string $uri): void
    {
        $matrix = Encoder::encode($uri, ErrorCorrectionLevel::L(), 'utf-8')->getMatrix();
        $width = $matrix->getWidth();
        $height = $matrix->getHeight();

        // Scanners need a margin of light modules around the code, or they cannot find its edges.
        $quiet = 4;
        $isDark = function (int $x, int $y) use ($matrix, $width, $height, $quiet): bool {
            $x -= $quiet;
            $y -= $quiet;

            if ($x < 0 || $y < 0 || $x >= $width || $y >= $height) {
                return false;
            }

            return $matrix->get($x, $y) === 1;
        };

        for ($y = 0; $y < $height + $quiet * 2; $y += 2) {
            $line = '';

            for ($x = 0; $x < $width + $quiet * 2; $x++) {
                // Foreground paints the top half of the cell, background the bottom half.
                $top = $isDark($x, $y) ? '30' : '97';
                $bottom = $isDark($x, $y + 1) ? '40' : '107';
                $line .= "\e[{$top};{$bottom}m\u{2580}";
            }

            // Straight to the underlying output, not $this->output: Laravel wraps that in a style
            // object that strips ANSI whenever it decides the stream is undecorated, which would
            // flatten the QR into one solid block of identical characters. OUTPUT_RAW then stops
            // Symfony from treating the escapes as markup.
            $this->output->getOutput()->writeln($line."\e[0m", OutputInterface::OUTPUT_RAW);
        }
    }
}
