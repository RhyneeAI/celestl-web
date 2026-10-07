import AdminLayout from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';

export default function AdminSongs() {
    return (
        <AdminLayout title="Songs & charts">
            <Head title="Admin · Songs & charts" />
            <div className="rounded-2xl bg-card p-5 text-muted">
                Coming soon.
            </div>
        </AdminLayout>
    );
}
