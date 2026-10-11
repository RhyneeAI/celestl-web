import AppLayout from '@/layouts/app-layout';
import { useTranslations } from '@/lib/i18n';
import { Head, router } from '@inertiajs/react';

type Identity = { nickname: string; player_id: string } | null;

export default function Profile({
    identity,
    member_since,
}: {
    identity: Identity;
    member_since: string | null;
}) {
    const t = useTranslations();

    return (
        <AppLayout>
            <Head title={t('account.profile')} />

            <div className="mx-auto w-full max-w-[520px] pt-2">
                <h1 className="px-1 pb-4 text-[20px] font-semibold">{t('account.profile')}</h1>

                <section className="rounded-3xl bg-card p-5">
                    <div className="flex items-center gap-3.5">
                        <span className="grid size-14 flex-none place-items-center rounded-full bg-badge text-[20px] font-bold">
                            {identity?.nickname.slice(0, 1).toUpperCase() ?? '?'}
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-[17px] font-semibold">
                                {identity?.nickname ?? '—'}
                            </p>
                            <p className="font-mono text-[12.5px] tracking-wide text-muted">
                                {identity?.player_id ?? '—'}
                            </p>
                        </div>
                    </div>

                    {member_since && (
                        <p className="mt-4 px-1 text-[12px] text-dim">
                            {t('account.member_since')} : {member_since}
                        </p>
                    )}
                </section>

                <button
                    type="button"
                    onClick={() => router.post('/logout')}
                    className="mt-4 w-full rounded-xl border-2 border-dashed border-lav py-3 text-[13px] font-semibold text-muted hover:text-text"
                >
                    {t('account.sign_out')}
                </button>
            </div>
        </AppLayout>
    );
}
