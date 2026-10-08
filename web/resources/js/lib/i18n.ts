import { usePage } from '@inertiajs/react';

type Translations = Record<string, unknown>;

/**
 * Reads UI strings shared by HandleInertiaRequests from lang/<locale>/app.php.
 *
 * Keys are dotted ('songs.title'); :placeholders are replaced from `replace`. A missing key returns
 * the key itself rather than throwing, so a typo shows up on screen instead of blanking the page.
 */
export function useTranslations() {
    const { translations } = usePage().props as unknown as {
        translations: Translations;
    };

    return function t(key: string, replace: Record<string, string | number> = {}): string {
        const value = key
            .split('.')
            .reduce<unknown>(
                (carry, part) =>
                    carry && typeof carry === 'object'
                        ? (carry as Record<string, unknown>)[part]
                        : undefined,
                translations,
            );

        if (typeof value !== 'string') {
            return key;
        }

        return Object.entries(replace).reduce(
            (text, [token, replacement]) => text.replaceAll(`:${token}`, String(replacement)),
            value,
        );
    };
}
