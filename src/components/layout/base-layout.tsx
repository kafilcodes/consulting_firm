'use client';

import React, { ReactNode } from 'react';
import { Navbar } from './navbar';
import { Footer } from './footer';
import { useAppSelector } from '@/store/hooks';
import { motion } from 'framer-motion';

export type LayoutVariant = 'default' | 'admin' | 'client';

interface BaseLayoutProps {
  children: ReactNode;
  variant?: LayoutVariant;
  showNavbar?: boolean;
  showFooter?: boolean;
  pageTitle?: string;
  pageDescription?: string;
}

/**
 * Base layout component that serves as the foundation for all pages
 * Provides consistent layout structure with role-specific styling
 */
export function BaseLayout({
  children,
  variant = 'default',
  showNavbar = true,
  showFooter = true,
  pageTitle,
  pageDescription
}: BaseLayoutProps) {
  const { user } = useAppSelector(state => state.auth);
  
  // Animation variants
  const pageTransition = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3 }
  };

  // Apply variant-specific styling
  const getVariantStyles = () => {
    switch (variant) {
      case 'admin':
        return 'bg-gray-50';
      case 'client':
        return 'bg-white';
      default:
        return 'bg-white';
    }
  };

  const containerClass = `min-h-screen flex flex-col ${getVariantStyles()}`;

  return (
    <div className={containerClass}>
      {showNavbar && <Navbar variant={variant} />}

      <main className="flex-grow">
        {pageTitle && (
          <div className="bg-white border-b border-gray-200 mb-6">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">{pageTitle}</h1>
              {pageDescription && (
                <p className="mt-1 text-sm text-gray-500">{pageDescription}</p>
              )}
            </div>
          </div>
        )}

        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageTransition}
          className="w-full"
        >
          {children}
        </motion.div>
      </main>

      {showFooter && <Footer variant={variant} />}
    </div>
  );
} 