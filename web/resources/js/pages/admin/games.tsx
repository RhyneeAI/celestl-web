import AdminLayout from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';

export default function AdminGames() {
    return (
        <AdminLayout title="Game management">
            <Head title="Admin · Game management" />
            <div className="rounded-2xl bg-card p-5 text-muted">
                Coming soon.
            </div>
        </AdminLayout>
    );
}
