import AppLayout from '@/layouts/app-layout';
import { useTranslations } from '@/lib/i18n';
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

export default function Register() {
    const t = useTranslations();
    const { data, setData, post, processing, errors } = useForm({
        player_id: '',
        nickname: '',
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        post('/register');
    }

    return (
        <AppLayout>
            <Head title={t('account.register')} />

            <div className="mx-auto w-full max-w-[380px] pt-6">
                <h1 className="px-1 pb-4 text-center text-[20px] font-semibold">
                    {t('account.register')}
                </h1>

                <form onSubmit={submit} className="rounded-3xl bg-card p-5">
                    <label
                        htmlFor="player_id"
                        className="px-1 text-[11px] font-bold tracking-[0.14em] text-dim uppercase"
                    >
                        {t('account.player_id')}
                    </label>
                    <input
                        id="player_id"
                        value={data.player_id}
                        onChange={(event) => setData('player_id', event.target.value)}
                        placeholder={t('account.identity_placeholder')}
                        inputMode="numeric"
                        autoFocus
                        aria-invalid={Boolean(errors.player_id)}
                        className="mt-2 w-full rounded-xl bg-violet px-4 py-3 text-center font-mono text-[18px] text-text placeholder:text-dim focus:ring-2 focus:ring-pst/60 focus:outline-none"
                    />
                    <p className="mt-1.5 px-1 text-[11.5px] text-dim">
                        {t('account.player_id_hint')}
                    </p>
                    {errors.player_id && (
                        <p className="mt-1.5 text-[12.5px] text-byd">{errors.player_id}</p>
                    )}

                    <label
                        htmlFor="nickname"
                        className="mt-4 block px-1 text-[11px] font-bold tracking-[0.14em] text-dim uppercase"
                    >
                        {t('account.nickname')}
                    </label>
                    <input
                        id="nickname"
                        value={data.nickname}
                        onChange={(event) => setData('nickname', event.target.value)}
                        placeholder={t('account.nickname_placeholder')}
                        maxLength={64}
                        aria-invalid={Boolean(errors.nickname)}
                        className="mt-2 w-full rounded-xl bg-violet px-4 py-3 text-[15px] text-text placeholder:text-dim focus:ring-2 focus:ring-pst/60 focus:outline-none"
                    />
                    <p className="mt-1.5 px-1 text-[11.5px] text-dim">
                        {t('account.nickname_hint')}
                    </p>
                    {errors.nickname && (
                        <p className="mt-1.5 text-[12.5px] text-byd">{errors.nickname}</p>
                    )}

                    {/*
                     * Said plainly, as the mockup wrote it. The owner chose to ship open rather
                     * than add a secret, so the honest warning is the whole of the protection.
                     */}
                    <div className="mt-4 rounded-2xl bg-violet p-3.5">
                        <p className="text-[11px] font-bold tracking-[0.14em] text-warn uppercase">
                            {t('account.heads_up')}
                        </p>
                        <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
                            {t('account.no_password_warning')}
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={
                            processing ||
                            data.player_id.trim() === '' ||
                            data.nickname.trim() === ''
                        }
                        className="mt-4 w-full rounded-xl bg-lav py-3 text-[13.5px] font-bold text-text disabled:opacity-50"
                    >
                        {t('account.register')}
                    </button>
                </form>

                <p className="mt-4 text-center text-[12.5px] text-dim">
                    {t('account.have_account')}{' '}
                    <Link href="/login" className="font-semibold text-pst hover:underline">
                        {t('account.sign_in')}
                    </Link>
                </p>
            </div>
        </AppLayout>
    );
}
