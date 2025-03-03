import { ClientNavbar } from '@/components/client/navbar';
import { ClientFooter } from '@/components/client/footer';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['client']}>
      <div className="min-h-screen flex flex-col">
        <ClientNavbar />
        <main className="flex-grow">
          {children}
        </main>
        <ClientFooter />
      </div>
    </ProtectedRoute>
  );
} 