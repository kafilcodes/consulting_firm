import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminHeader } from '@/components/admin/header';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['admin', 'employee']}>
      <div className="min-h-screen flex">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-6 bg-gray-100">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
} 