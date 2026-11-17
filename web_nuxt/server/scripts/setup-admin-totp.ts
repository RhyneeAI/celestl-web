import { generateSecret, generateURI } from 'otplib';
import QRCode from 'qrcode';
import { db, schema } from '../database/index.ts';
import { eq } from 'drizzle-orm';

async function main() {
    const args = process.argv.slice(2);
    let email = '';
    for (const arg of args) {
        if (arg.startsWith('--email=')) {
            email = arg.split('=')[1];
        }
    }

    if (!email) {
        email = 'admin@celestl.moe';
    }

    const currentAccount = db.select().from(schema.adminAccounts).where(eq(schema.adminAccounts.singleton, 1)).get();
    if (currentAccount && currentAccount.confirmedAt) {
        console.error(`\x1b[31m[ERROR] This install is already claimed and locked by ${currentAccount.email}.\x1b[0m`);
        console.error('To re-enrol, clear the admin account in the database first:');
        console.error('  DELETE FROM admin_accounts;');
        process.exit(1);
    }

    const secret = generateSecret();
    const serviceName = 'Celestl';
    const otpauthUrl = generateURI({
        secret,
        issuer: serviceName,
        label: email,
    });

    if (currentAccount) {
        db.update(schema.adminAccounts)
            .set({
                email,
                totpSecret: secret,
                confirmedAt: null,
            })
            .where(eq(schema.adminAccounts.id, currentAccount.id))
            .run();
    } else {
        db.insert(schema.adminAccounts).values({
            email,
            totpSecret: secret,
            singleton: 1,
            createdAt: new Date(),
        }).run();
    }

    console.log(`\n\x1b[1mEnrolling \x1b[35m${email}\x1b[0m\x1b[1m as the admin of this install.\x1b[0m\n`);
    console.log('Scan this with Google Authenticator or your authenticator app:\n');

    try {
        const qrString = await QRCode.toString(otpauthUrl, { type: 'terminal', small: true });
        console.log(qrString);
    } catch (e) {
        console.log('QR Code rendering unavailable, please enter setup key manually.');
    }

    console.log('\nNo camera? Enter this setup key by hand:');
    console.log(`  \x1b[32m\x1b[1m${secret}\x1b[0m\n`);
    console.log('Sign in once at \x1b[1m/admin/login\x1b[0m. The first valid code locks the enrolment.\n');
}

main().catch(err => {
    console.error('Failed to set up TOTP:', err);
    process.exit(1);
});
