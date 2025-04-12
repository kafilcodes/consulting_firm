'use client';

import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { ClientSidebar } from '@/components/layout/client-sidebar';
import { Icons } from '@/components/icons';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { signOut } from '@/store/slices/authSlice';
import { useAppDispatch } from '@/store/hooks';
import { toast } from 'react-hot-toast';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const handleSignOut = async () => {
    try {
      await dispatch(signOut()).unwrap();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  // If loading, show a loading state
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Icons.spinner className="h-10 w-10 animate-spin text-primary" />
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  // If no user, this shouldn't happen due to middleware, but handle just in case
  if (!user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <Icons.warning className="h-10 w-10 text-yellow-500" />
        <h1 className="mt-4 text-xl font-semibold">Access Denied</h1>
        <p className="mt-2 text-muted-foreground">
          You need to be signed in to access this page.
        </p>
        <Link href="/signin" className="mt-4 text-primary hover:underline">
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <ClientSidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm dark:bg-gray-800">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-semibold text-gray-800 dark:text-white"
            >
              Client Dashboard
            </motion.h1>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex md:items-center md:space-x-4">
                <button 
                  className="rounded-full bg-primary/10 p-2 text-primary hover:bg-primary/20"
                  aria-label="Notifications"
                >
                  <Icons.bell className="h-5 w-5" />
                </button>
                <button 
                  className="rounded-full bg-primary/10 p-2 text-primary hover:bg-primary/20"
                  aria-label="Messages"
                >
                  <Icons.message className="h-5 w-5" />
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <div className="hidden text-right md:block">
                  <p className="text-sm font-medium">{user.displayName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <div className="relative">
                  <button 
                    className="flex rounded-full bg-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:bg-gray-700"
                    id="user-menu-button"
                    aria-expanded="false"
                    aria-haspopup="true"
                    onClick={handleSignOut}
                  >
                    <span className="sr-only">Open user menu</span>
                    {user.photoURL ? (
                      <img 
                        className="h-8 w-8 rounded-full"
                        src={user.photoURL}
                        alt={user.displayName || "User"}
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mx-auto max-w-7xl"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
} 