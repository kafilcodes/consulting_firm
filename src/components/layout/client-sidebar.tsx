'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { Icons } from '@/components/icons';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface SidebarLink {
  name: string;
  href: string;
  icon: keyof typeof Icons;
}

const navigation: SidebarLink[] = [
  { name: 'Dashboard', href: '/client/dashboard', icon: 'layoutDashboard' },
  { name: 'Projects', href: '/client/projects', icon: 'folder' },
  { name: 'Team', href: '/client/team', icon: 'users' },
  { name: 'Billing', href: '/client/billing', icon: 'creditCard' },
  { name: 'Help', href: '/client/help', icon: 'helpCircle' },
];

interface ClientSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function ClientSidebar({ isOpen, setIsOpen }: ClientSidebarProps) {
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);
  const [isMobile, setIsMobile] = useState(false);

  // Check if the viewport is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      }
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, [setIsOpen]);

  // Create user initials for the avatar
  const getUserInitials = () => {
    if (!user?.displayName) return 'C';
    return user.displayName
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Animation variants for mobile sidebar
  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: "-100%", opacity: 0 }
  };

  // Element to render for sidebar
  const sidebarElement = (
    <div className={`flex h-full flex-col border-r border-gray-200 bg-white ${isMobile ? 'w-64' : ''}`}>
      <div className="flex h-16 shrink-0 items-center border-b border-gray-200 px-4">
        <Link href="/client/dashboard" className="flex items-center space-x-2">
          <span className="rounded-md bg-blue-600 p-1">
            <Icons.logo className="h-6 w-6 text-white" />
          </span>
          <span className="text-lg font-bold text-gray-900">Client Portal</span>
        </Link>
      </div>
      
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Navigation links */}
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navigation.map((item) => {
            const Icon = Icons[item.icon];
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 shrink-0 ${
                  isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-900'
                }`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* User profile section */}
      <div className="shrink-0 border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="h-10 w-10 shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-white">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'Client'} className="h-10 w-10 rounded-full" />
            ) : (
              <span>{getUserInitials()}</span>
            )}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              {user?.displayName || 'Client User'}
            </p>
            <p className="text-xs text-gray-500">{user?.email || ''}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Render different versions based on viewport size
  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Sidebar */}
            <AnimatePresence>
              {isOpen && (
                <motion.div 
                  className="fixed inset-y-0 left-0 z-40 w-64 flex"
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={sidebarVariants}
                  transition={{ duration: 0.25 }}
                >
                  <div className="relative flex-1 flex flex-col w-full max-w-xs">
                    {/* Close button */}
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen(false)}
                        className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      >
                        <span className="sr-only">Close sidebar</span>
                        <Icons.x className="h-6 w-6 text-white" aria-hidden="true" />
                      </Button>
                    </div>
                    {sidebarElement}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </>
    );
  }
  
  // Desktop sidebar
  return (
    <div className={`hidden lg:block lg:w-64 ${isOpen ? 'lg:block' : 'lg:hidden'}`}>
      {sidebarElement}
    </div>
  );
} 