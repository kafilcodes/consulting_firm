import type { Metadata } from 'next';
import React from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { ClientNavigation } from '@/components/layout/client-navigation';
import ClientFooter from '@/components/layout/client-footer';

export const metadata: Metadata = {
  title: 'SKS Consulting - Client Portal',
  description: 'Access your client portal for SKS Consulting services',
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['client', 'admin']} showUnauthorizedPage={true}>
      <div className="flex flex-col min-h-screen">
        <ClientNavigation />
        <main className="flex-1">{children}</main>
        <ClientFooter />
      </div>
    </ProtectedRoute>
  );
} 