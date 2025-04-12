'use client';

import { Fragment, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { signOut } from '@/store/slices/authSlice';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LayoutVariant } from './base-layout';

// Define navigation items by variant
const getNavItems = (variant: LayoutVariant, isAuthenticated: boolean) => {
  // Common navigation items for all variants
  const common = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  // Role-specific navigation items
  switch (variant) {
    case 'admin':
      return [
        { name: 'Dashboard', href: '/admin' },
        { name: 'Users', href: '/admin/users' },
        { name: 'Orders', href: '/admin/orders' },
        { name: 'Services', href: '/admin/services' },
        { name: 'Settings', href: '/admin/settings' },
      ];
    case 'client':
      return [
        { name: 'Dashboard', href: '/client' },
        { name: 'Services', href: '/client/services' },
        { name: 'My Orders', href: '/client/orders' },
        { name: 'Support', href: '/client/support' },
      ];
    default:
      // For the default/public variant, determine based on auth status
      return isAuthenticated 
        ? [{ name: 'Dashboard', href: '/client' }, ...common]
        : common;
  }
};

// Get user menu items based on role
const getUserMenuItems = (role?: string) => {
  const basePath = role === 'admin' || role === 'employee' ? '/admin' : '/client';
  
  return [
    { name: 'Your Profile', href: `${basePath}/profile` },
    { name: 'Settings', href: `${basePath}/settings` },
    // Sign out is handled separately as it's an action, not a link
  ];
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface NavbarProps {
  variant?: LayoutVariant;
}

export function Navbar({ variant = 'default' }: NavbarProps) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const [signingOut, setSigningOut] = useState(false);

  // Memoize navigation items to prevent unnecessary recalculations
  const navigation = useMemo(() => 
    getNavItems(variant, !!user), 
    [variant, !!user]
  );

  const userMenuItems = useMemo(() => 
    getUserMenuItems(user?.role), 
    [user?.role]
  );

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      toast.info('Signing out...', { id: 'signout-loading' });
      await dispatch(signOut()).unwrap();
      toast.success('Successfully signed out', { id: 'signout-success' });
      // Redirect will be handled by middleware
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out. Please try again.', { id: 'signout-error' });
    } finally {
      setSigningOut(false);
    }
  };

  const getUserInitials = () => {
    if (!user?.displayName) return 'U';
    return user.displayName
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Dynamic navbar styles based on variant
  const getNavbarStyles = () => {
    switch (variant) {
      case 'admin':
        return 'bg-gray-800 text-white shadow';
      case 'client':
        return 'bg-white shadow-md';
      default:
        return 'bg-white shadow';
    }
  };

  // Dynamic link styles based on variant
  const getLinkStyles = (isActive: boolean) => {
    if (variant === 'admin') {
      return isActive
        ? 'border-indigo-500 text-white'
        : 'border-transparent text-gray-300 hover:border-gray-300 hover:text-white';
    }
    
    return isActive
      ? 'border-indigo-500 text-gray-900'
      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700';
  };

  return (
    <Disclosure as="nav" className={getNavbarStyles()}>
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <Link 
                    href="/" 
                    className={classNames(
                      'text-xl font-bold',
                      variant === 'admin' ? 'text-white' : 'text-gray-900'
                    )}
                  >
                    SKS Consulting
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        pathname === item.href || pathname.startsWith(item.href + '/')
                          ? getLinkStyles(true)
                          : getLinkStyles(false),
                        'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium'
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                {user ? (
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className={classNames(
                        "flex rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                        variant === 'admin' ? 'ring-offset-gray-800' : 'ring-offset-white'
                      )}>
                        <span className="sr-only">Open user menu</span>
                        <Avatar>
                          <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                          <AvatarFallback className={variant === 'admin' ? 'bg-gray-700 text-white' : undefined}>
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {/* Username display */}
                        <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                          <p className="font-medium">{user.displayName}</p>
                          <p className="text-gray-500 text-xs mt-1 truncate">{user.email}</p>
                        </div>
                        
                        {/* Navigation items */}
                        {userMenuItems.map((item) => (
                          <Menu.Item key={item.name}>
                            {({ active }) => (
                              <Link
                                href={item.href}
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block px-4 py-2 text-sm text-gray-700'
                                )}
                              >
                                {item.name}
                              </Link>
                            )}
                          </Menu.Item>
                        ))}
                        
                        {/* Sign out button */}
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleSignOut}
                              disabled={signingOut || isLoading}
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                (signingOut || isLoading) ? 'opacity-50 cursor-not-allowed' : '',
                                'block w-full text-left px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              {signingOut ? 'Signing out...' : 'Sign out'}
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <div className="space-x-4">
                    <Button asChild variant="ghost">
                      <Link href="/auth/sign-in">
                        Sign in
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link href="/auth/sign-in">
                        Get Started
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className={classNames(
                  "inline-flex items-center justify-center rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500",
                  variant === 'admin' 
                    ? 'text-gray-400 hover:bg-gray-700 hover:text-white' 
                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-500'
                )}>
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pt-2 pb-3">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  href={item.href}
                  className={classNames(
                    pathname === item.href || pathname.startsWith(item.href + '/')
                      ? variant === 'admin'
                        ? 'bg-gray-900 border-indigo-500 text-white'
                        : 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : variant === 'admin'
                        ? 'border-transparent text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700',
                    'block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4 pb-3">
              {user ? (
                <>
                  <div className="flex items-center px-4">
                    <div className="flex-shrink-0">
                      <Avatar>
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                        <AvatarFallback className={variant === 'admin' ? 'bg-gray-700 text-white' : undefined}>
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="ml-3">
                      <div className={classNames(
                        "text-base font-medium",
                        variant === 'admin' ? 'text-white' : 'text-gray-800'
                      )}>
                        {user.displayName}
                      </div>
                      <div className={classNames(
                        "text-sm font-medium",
                        variant === 'admin' ? 'text-gray-400' : 'text-gray-500'
                      )}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    {userMenuItems.map((item) => (
                      <Disclosure.Button
                        key={item.name}
                        as={Link}
                        href={item.href}
                        className={classNames(
                          variant === 'admin'
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800',
                          'block px-4 py-2 text-base font-medium'
                        )}
                      >
                        {item.name}
                      </Disclosure.Button>
                    ))}
                    <Disclosure.Button
                      as="button"
                      onClick={handleSignOut}
                      disabled={signingOut || isLoading}
                      className={classNames(
                        variant === 'admin'
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800',
                        (signingOut || isLoading) ? 'opacity-50 cursor-not-allowed' : '',
                        'block w-full text-left px-4 py-2 text-base font-medium'
                      )}
                    >
                      {signingOut ? 'Signing out...' : 'Sign out'}
                    </Disclosure.Button>
                  </div>
                </>
              ) : (
                <div className="mt-3 space-y-1">
                  <Disclosure.Button
                    as={Link}
                    href="/auth/sign-in"
                    className={classNames(
                      variant === 'admin'
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800',
                      'block px-4 py-2 text-base font-medium'
                    )}
                  >
                    Sign in / Get Started
                  </Disclosure.Button>
                </div>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
} 