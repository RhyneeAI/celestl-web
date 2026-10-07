import AdminLayout from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';

export default function AdminHome() {
    return (
        <AdminLayout title="Home">
            <Head title="Admin · Home" />
            <div className="rounded-2xl bg-card p-5 text-muted">
                Coming soon.
            </div>
        </AdminLayout>
    );
}
