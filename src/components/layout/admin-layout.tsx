'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BaseLayout } from './base-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  FileText,
  Settings,
  BarChart,
  MessageSquare,
  Bell,
  Menu,
  X,
  Search
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Admin navigation items
const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Projects', href: '/admin/projects', icon: Briefcase },
  { name: 'Calendar', href: '/admin/calendar', icon: Calendar },
  { name: 'Reports', href: '/admin/reports', icon: BarChart },
  { name: 'Documents', href: '/admin/documents', icon: FileText },
  { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

interface AdminLayoutProps {
  children: ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  showNavbar?: boolean;
  showFooter?: boolean;
}

/**
 * Admin-specific layout with role-based protection
 * Features a full dashboard with comprehensive admin controls
 */
export function AdminLayout({
  children,
  pageTitle,
  pageDescription,
  showNavbar = true,
  showFooter = false
}: AdminLayoutProps) {
  const pathname = usePathname();
  const { user } = useAppSelector(state => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Create user initials for the avatar
  const getUserInitials = () => {
    if (!user?.displayName) return 'A';
    return user.displayName
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <BaseLayout variant="default" showNavbar={showNavbar} showFooter={showFooter}>
        <div className="h-screen flex overflow-hidden bg-gray-100">
          {/* Mobile sidebar overlay */}
          <div 
            className={`fixed inset-0 flex z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`} 
            role="dialog" 
            aria-modal="true"
          >
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-gray-600 bg-opacity-75" 
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
            
            {/* Sidebar */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-gray-800">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                >
                  <span className="sr-only">Close sidebar</span>
                  <X className="h-6 w-6 text-white" aria-hidden="true" />
                </Button>
              </div>
              
              {/* Sidebar content */}
              <div className="flex-shrink-0 flex items-center px-4">
                <span className="text-lg font-bold text-white">Admin Portal</span>
              </div>
              <div className="mt-5 flex-1 h-0 overflow-y-auto">
                <nav className="px-2 space-y-1">
                  {navigation.map((item) => (
                    <AdminNavLink key={item.name} item={item} pathname={pathname} />
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Static sidebar for desktop */}
          <div className="hidden lg:flex lg:flex-shrink-0">
            <div className="flex flex-col w-64">
              {/* Sidebar component */}
              <div className="flex flex-col h-0 flex-1 bg-gray-800">
                <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
                  <span className="text-lg font-bold text-white">Admin Portal</span>
                </div>
                <div className="flex-1 flex flex-col overflow-y-auto">
                  <nav className="flex-1 px-2 py-4 space-y-1">
                    {navigation.map((item) => (
                      <AdminNavLink key={item.name} item={item} pathname={pathname} />
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col w-0 flex-1 overflow-hidden">
            <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
              >
                <span className="sr-only">Open sidebar</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
              </Button>
              
              <div className="flex-1 px-4 flex justify-between">
                <div className="flex-1 flex">
                  <form className="w-full flex md:ml-0" action="#" method="GET">
                    <label htmlFor="search-field" className="sr-only">
                      Search
                    </label>
                    <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                      <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                        <Search className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <Input
                        id="search-field"
                        className="block pl-8 w-full h-full border-transparent bg-transparent text-gray-900 placeholder-gray-500 focus:ring-0 focus:border-transparent sm:text-sm"
                        placeholder="Search"
                        type="search"
                      />
                    </div>
                  </form>
                </div>
                <div className="ml-4 flex items-center md:ml-6">
                  {/* Notifications */}
                  <Button variant="ghost" size="icon" className="p-1 rounded-full text-gray-400 hover:text-gray-500 relative">
                    <span className="sr-only">View notifications</span>
                    <Bell className="h-6 w-6" aria-hidden="true" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                  </Button>

                  {/* Profile dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="ml-3 p-1 rounded-full">
                        <span className="sr-only">Open user menu</span>
                        <Avatar>
                          <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'Admin'} />
                          <AvatarFallback className="bg-indigo-600 text-white">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        {user?.displayName || 'Admin User'}
                        <div className="text-xs text-gray-500 font-normal">{user?.email}</div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Link href="/admin/profile" className="w-full">
                          Your Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/admin/settings" className="w-full">
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Link href="/sign-out" className="w-full">
                          Sign out
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            <main className="flex-1 relative overflow-y-auto focus:outline-none">
              <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {pageTitle || 'Admin Dashboard'}
                  </h1>
                  {pageDescription && (
                    <p className="mt-1 text-sm text-gray-500">{pageDescription}</p>
                  )}
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-4">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
      </BaseLayout>
    </ProtectedRoute>
  );
}

// Helper component for admin navigation links
interface AdminNavLinkProps {
  item: { name: string; href: string; icon: React.ComponentType<any> };
  pathname: string;
}

function AdminNavLink({ item, pathname }: AdminNavLinkProps) {
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;
  
  return (
    <Link
      href={item.href}
      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
        isActive
          ? 'bg-gray-900 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      <Icon
        className={`mr-3 flex-shrink-0 h-5 w-5 ${
          isActive ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'
        }`}
        aria-hidden="true"
      />
      {item.name}
    </Link>
  );
} 