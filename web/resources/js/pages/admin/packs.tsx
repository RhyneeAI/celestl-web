import AdminLayout from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';

export default function AdminPacks() {
    return (
        <AdminLayout title="Packs">
            <Head title="Admin · Packs" />
            <div className="rounded-2xl bg-card p-5 text-muted">
                Coming soon.
            </div>
        </AdminLayout>
    );
}
