'use client';

import { ReactNode, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BaseLayout } from './base-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  UserCircle,
  LogOut,
  Settings,
  ChevronDown
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from '@/store/slices/authSlice';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

// Navigation items for the employee dashboard tabs - Simplified
const navigation = [
  { name: 'Dashboard', href: '/employee/dashboard', icon: LayoutDashboard },
  { name: 'Orders', href: '/employee/orders', icon: ClipboardList },
  { name: 'Profile', href: '/employee/profile', icon: UserCircle },
];

interface EmployeeLayoutProps {
  children: ReactNode;
  pageTitle?: string;
  pageDescription?: string;
}

/**
 * Employee-specific layout with role-based protection
 * Uses a horizontal tabbed navigation for a clean dashboard experience
 */
export function EmployeeLayout({
  children,
  pageTitle,
  pageDescription,
}: EmployeeLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const [signingOut, setSigningOut] = useState(false);
  
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

  // Handle sign out
  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await dispatch(signOut());
      toast.success('Signed out successfully');
      router.push('/auth/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out. Please try again.');
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['employee', 'admin']}>
      <BaseLayout variant="default" showNavbar={false} showFooter={false}>
        <div className="min-h-screen bg-gray-50">
          {/* Employee header with avatar and tabs */}
          <div className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                {/* Left side with page title */}
                <div className="flex items-center">
                  <h1 className="text-xl font-semibold text-gray-800">
                    {pageTitle || 'Employee Portal'}
                  </h1>
                </div>
                
                {/* Right side with user profile */}
                <div className="flex items-center">
                  {user && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="p-1">
                          <div className="flex items-center space-x-2">
                            <Avatar>
                              <AvatarImage 
                                src={user.photoURL || undefined} 
                                alt={user.displayName || 'Employee'} 
                                referrerPolicy="no-referrer"
                              />
                              <AvatarFallback className="bg-green-600 text-white">
                                {getUserInitials()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-gray-700 hidden md:inline-block">
                              {user.displayName}
                            </span>
                            <ChevronDown className="h-4 w-4 text-gray-500 hidden md:inline-block" />
                          </div>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                          <div className="flex flex-col">
                            <span>{user.displayName}</span>
                            <span className="text-xs font-normal text-gray-500 truncate">{user.email}</span>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          disabled={signingOut}
                          onClick={handleSignOut}
                          className="text-red-600 focus:text-red-500 cursor-pointer"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>{signingOut ? 'Signing out...' : 'Sign out'}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
              
              {/* Navigation links instead of tabs */}
              <div className="-mb-px">
                <nav className="flex space-x-4 border-b border-gray-200 overflow-x-auto pb-0">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const Icon = item.icon;
                    
                    return (
                      <Link 
                        key={item.name} 
                        href={item.href}
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
                      </Link>
                    );
                  })}
                </nav>
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