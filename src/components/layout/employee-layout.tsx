'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { BaseLayout } from './base-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Users,
  ClipboardList,
  Clock,
  FileText,
  Settings,
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Navigation items for the employee dashboard tabs
const navigation = [
  { name: 'Dashboard', href: '/employee', icon: LayoutDashboard },
  { name: 'Calendar', href: '/employee/calendar', icon: Calendar },
  { name: 'Tasks', href: '/employee/tasks', icon: ClipboardList },
  { name: 'Clients', href: '/employee/clients', icon: Users },
  { name: 'Timesheet', href: '/employee/timesheet', icon: Clock },
  { name: 'Chat', href: '/employee/chat', icon: MessageSquare },
  { name: 'Documents', href: '/employee/documents', icon: FileText },
  { name: 'Settings', href: '/employee/settings', icon: Settings },
];

interface EmployeeLayoutProps {
  children: ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  showNavbar?: boolean;
  showFooter?: boolean;
}

/**
 * Employee-specific layout with role-based protection
 * Uses a horizontal tabbed navigation for a clean dashboard experience
 */
export function EmployeeLayout({
  children,
  pageTitle,
  pageDescription,
  showNavbar = true,
  showFooter = true
}: EmployeeLayoutProps) {
  const pathname = usePathname();
  const { user } = useAppSelector(state => state.auth);
  
  // Create user initials for the avatar
  const getUserInitials = () => {
    if (!user?.displayName) return 'E';
    return user.displayName
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <ProtectedRoute allowedRoles={['employee', 'manager']}>
      <BaseLayout variant="default" showNavbar={showNavbar} showFooter={showFooter}>
        <div className="min-h-screen bg-gray-50">
          {/* Employee header with avatar and tabs */}
          <div className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                {/* Left side with page title */}
                <div className="flex items-center">
                  <h1 className="text-xl font-semibold text-gray-800">
                    {pageTitle || 'Employee Dashboard'}
                  </h1>
                </div>
                
                {/* Right side with user profile */}
                <div className="flex items-center">
                  {user && (
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-700 hidden md:inline-block">
                        {user.displayName}
                      </span>
                      <Avatar>
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'Employee'} />
                        <AvatarFallback className="bg-green-600 text-white">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Navigation tabs */}
              <div className="-mb-px">
                <Tabs defaultValue={pathname} className="w-full">
                  <TabsList className="w-full h-auto justify-start bg-transparent border-b border-gray-200 overflow-x-auto pb-0">
                    {navigation.map((item) => {
                      const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                      const Icon = item.icon;
                      
                      return (
                        <Link key={item.name} href={item.href} passHref>
                          <TabsTrigger
                            value={item.href}
                            className={`flex items-center px-3 py-2 text-sm font-medium border-b-2 ${
                              isActive
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <Icon
                              className={`mr-2 h-4 w-4 ${isActive ? 'text-blue-500' : 'text-gray-400'}`}
                              aria-hidden="true"
                            />
                            {item.name}
                          </TabsTrigger>
                        </Link>
                      );
                    })}
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Page description */}
            {pageDescription && (
              <p className="text-sm text-gray-500 mb-6">{pageDescription}</p>
            )}
            
            {/* Content */}
            <div className="bg-white shadow rounded-lg p-6">
              {children}
            </div>
          </div>
        </div>
      </BaseLayout>
    </ProtectedRoute>
  );
} 