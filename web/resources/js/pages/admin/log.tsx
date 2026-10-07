import AdminLayout from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';

export default function AdminLog() {
    return (
        <AdminLayout title="Activity log">
            <Head title="Admin · Activity log" />
            <div className="rounded-2xl bg-card p-5 text-muted">
                Coming soon.
            </div>
        </AdminLayout>
    );
}
