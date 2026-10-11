import AppLayout from '@/layouts/app-layout';
import { useTranslations } from '@/lib/i18n';
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

export default function Login() {
    const t = useTranslations();
    const { data, setData, post, processing, errors } = useForm({ identity: '' });

    function submit(event: FormEvent) {
        event.preventDefault();
        post('/login');
    }

    return (
        <AppLayout>
            <Head title={t('account.sign_in')} />

            <div className="mx-auto w-full max-w-[380px] pt-6">
                <h1 className="px-1 pb-4 text-center text-[20px] font-semibold">
                    {t('account.sign_in')}
                </h1>

                <form onSubmit={submit} className="rounded-3xl bg-card p-5">
                    <label
                        htmlFor="identity"
                        className="px-1 text-[11px] font-bold tracking-[0.14em] text-dim uppercase"
                    >
                        {t('account.identity')}
                    </label>
                    <input
                        id="identity"
                        value={data.identity}
                        onChange={(event) => setData('identity', event.target.value)}
                        placeholder={t('account.identity_placeholder')}
                        autoComplete="username"
                        autoFocus
                        aria-invalid={Boolean(errors.identity)}
                        className="mt-2 w-full rounded-xl bg-violet px-4 py-3 text-center font-mono text-[18px] text-text placeholder:text-dim focus:ring-2 focus:ring-pst/60 focus:outline-none"
                    />
                    {errors.identity && (
                        <p className="mt-2 text-[12.5px] text-byd">{errors.identity}</p>
                    )}

                    <button
                        type="submit"
                        disabled={processing || data.identity.trim() === ''}
                        className="mt-4 w-full rounded-xl bg-lav py-3 text-[13.5px] font-bold text-text disabled:opacity-50"
                    >
                        {t('account.sign_in')}
                    </button>

                    {/*
                     * Dashed, the Figma "Drop Image" treatment: present without competing with the
                     * primary action, since guest is a first-class way to use Celestl.
                     */}
                    <Link
                        href="/calculator"
                        className="mt-2.5 block rounded-xl border-2 border-dashed border-lav py-3 text-center text-[13px] font-semibold text-muted hover:text-text"
                    >
                        {t('account.guest')}
                    </Link>
                </form>

                <p className="mt-4 text-center text-[12.5px] text-dim">
                    {t('account.no_account')}{' '}
                    <Link href="/register" className="font-semibold text-pst hover:underline">
                        {t('account.register')}
                    </Link>
                </p>
            </div>
        </AppLayout>
    );
}
