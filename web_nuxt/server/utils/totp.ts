import { generateSecret, generateURI, verifySync } from 'otplib';
import { db, schema } from '../database/index.ts';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const SECRET_KEY = process.env.SESSION_SECRET || 'celestl_secret_salt_2026_default';

export function getAdminAccount() {
    return db.select().from(schema.adminAccounts).where(eq(schema.adminAccounts.singleton, 1)).get();
}

export function isTotpConfigured(): boolean {
    return Boolean(getAdminAccount());
}

export function createTotpSecret(email: string): { secret: string; uri: string } {
    const secret = generateSecret();
    const uri = generateURI({
        secret,
        issuer: 'Celestl',
        label: email,
    });
    return { secret, uri };
}

export function verifyTotpCode(code: string): boolean {
    const account = getAdminAccount();
    if (!account) return false;

    const cleanedCode = code.replace(/\D/g, '');
    try {
        const result = verifySync({
            secret: account.totpSecret,
            token: cleanedCode,
            epochTolerance: 30, // 30 seconds leeway (1 time step)
        });

        const isValid = Boolean(result && result.valid);

        if (isValid && !account.confirmedAt) {
            db.update(schema.adminAccounts)
                .set({ confirmedAt: new Date() })
                .where(eq(schema.adminAccounts.id, account.id))
                .run();
        }

        return isValid;
    } catch {
        return false;
    }
}

export function createAdminSessionToken(): string {
    const now = Date.now();
    const payload = `${now}:${crypto.randomBytes(16).toString('hex')}`;
    const hmac = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
    return `${payload}:${hmac}`;
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
    if (!token) return false;
    const parts = token.split(':');
    if (parts.length !== 3) return false;

    const [timestampStr, random, hmac] = parts;
    const payload = `${timestampStr}:${random}`;
    const expectedHmac = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');

    try {
        if (!crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac))) {
            return false;
        }
    } catch {
        return false;
    }

    const timestamp = parseInt(timestampStr, 10);
    // 7 days expiration
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > maxAge) {
        return false;
    }

    return true;
}
