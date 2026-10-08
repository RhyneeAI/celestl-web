import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

/**
 * Admin sign-in: a six-digit code from an authenticator app, no password.
 *
 * Deliberately says nothing about what is behind it and shows no hint about the secret -- the only
 * thing this page can tell an unauthenticated visitor is whether their code was right.
 */
export default function AdminLogin({ enrolled }: { enrolled: boolean }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        post('/admin/login', { onError: () => reset('code') });
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-bg px-4 text-text">
            <Head title="Admin sign in" />

            <div className="w-full max-w-[360px]">
                <div className="mb-6 flex items-center gap-2.5">
                    <div className="size-7 flex-none rotate-45 rounded-[9px] bg-lav" />
                    <b className="font-brand text-[17px] font-semibold tracking-wide">
                        CELESTL
                    </b>
                </div>

                {enrolled ? (
                    <form
                        onSubmit={submit}
                        className="rounded-3xl bg-card p-6"
                    >
                        <h1 className="text-[17px] font-semibold">Admin</h1>
                        <p className="mt-1 text-[12.5px] text-muted">
                            Enter the current code from your authenticator app.
                        </p>

                        <input
                            value={data.code}
                            onChange={(event) =>
                                setData('code', event.target.value)
                            }
                            // inputMode numeric brings up the digits keypad on a phone; one-time-code
                            // lets the OS offer the code it just saw.
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            autoFocus
                            maxLength={7}
                            aria-label="Authentication code"
                            aria-invalid={Boolean(errors.code)}
                            placeholder="000000"
                            className="mt-4 w-full rounded-xl bg-violet px-4 py-3 text-center font-mono text-[22px] tracking-[0.35em] text-text placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-pst/60"
                        />

                        {errors.code && (
                            <p className="mt-2 text-[12.5px] text-byd">
                                {errors.code}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={processing || data.code.length < 6}
                            className="mt-4 w-full rounded-xl bg-lav py-3 text-[13.5px] font-bold text-text disabled:opacity-50"
                        >
                            {processing ? 'Checking…' : 'Sign in'}
                        </button>
                    </form>
                ) : (
                    <div className="rounded-3xl bg-card p-6">
                        <h1 className="text-[17px] font-semibold">
                            Admin is locked
                        </h1>
                        <p className="mt-1.5 text-[12.5px] text-muted">
                            Nobody has claimed this install yet, so there is no
                            code that would work. Enrol once from the server:
                        </p>
                        <pre className="mt-3 overflow-x-auto rounded-xl bg-violet px-4 py-3 font-mono text-[12px] text-text">
                            php artisan celestl:admin-totp --email=you@example.com
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}
