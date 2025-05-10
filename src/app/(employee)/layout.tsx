import { EmployeeLayout } from '@/components/layout/employee-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function EmployeeRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['employee', 'admin']}>
      <EmployeeLayout>{children}</EmployeeLayout>
    </ProtectedRoute>
  );
} 