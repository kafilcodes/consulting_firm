'use client';

import { Fragment, useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { signOut } from '@/store/slices/authSlice';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LayoutVariant } from './base-layout';
import { Logo } from '@/components/logo';
import { 
  ChevronDown, 
  Menu as MenuIcon, 
  X, 
  UserCircle2, 
  ChevronRight,
  LogOut,
  Settings,
  User,
  Home,
  Info,
  Mail,
  LayoutDashboard,
  Users,
  ClipboardList,
  Briefcase,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Define navigation items by variant
const getNavItems = (variant: LayoutVariant, isAuthenticated: boolean) => {
  // Common navigation items for all variants
  const common = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'About', href: '/about', icon: Info },
    { name: 'Contact', href: '/contact', icon: Mail },
  ];

  // Role-specific navigation items
  switch (variant) {
    case 'admin':
      return [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Orders', href: '/admin/orders', icon: ClipboardList },
        { name: 'Services', href: '/admin/services', icon: Briefcase },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
      ];
    case 'client':
      return [
        { name: 'Dashboard', href: '/client', icon: LayoutDashboard },
        { name: 'Services', href: '/client/services', icon: Briefcase },
        { name: 'My Orders', href: '/client/orders', icon: ClipboardList },
        { name: 'Support', href: '/client/support', icon: HelpCircle },
      ];
    default:
      // For the default/public variant, determine based on auth status
      return isAuthenticated 
        ? [{ name: 'Dashboard', href: '/client', icon: LayoutDashboard }, ...common]
        : common;
  }
};

// Get user menu items based on role
const getUserMenuItems = (role?: string) => {
  const basePath = role === 'admin' || role === 'employee' ? '/admin' : '/client';
  
  return [
    { name: 'Your Profile', href: `${basePath}/profile`, icon: User },
    { name: 'Settings', href: `${basePath}/settings`, icon: Settings },
    // Sign out is handled separately as it's an action, not a link
  ];
};

// Animation variants
const navbarVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.05
    }
  }
};

const navItemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const dropdownVariants = {
  hidden: { opacity: 0, y: -5, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface NavbarProps {
  variant?: LayoutVariant;
}

// Helper function for nav link classes
function getNavLinkClasses(isCurrent: boolean, variant: LayoutVariant) {
  const baseClasses = "relative px-3 py-2 rounded-md text-sm transition-all duration-200 ease-in-out flex items-center";
  
  if (variant === 'admin') {
    return isCurrent
      ? `text-white bg-gray-800 ${baseClasses}`
      : `text-gray-300 hover:bg-gray-700 hover:text-white ${baseClasses}`;
  }
  
  return isCurrent
    ? `text-blue-600 bg-blue-50/50 dark:bg-blue-900/10 ${baseClasses}`
    : `text-gray-600 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800/30 ${baseClasses}`;
}

export function Navbar({ variant = 'default' }: NavbarProps) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const [signingOut, setSigningOut] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle scroll effect for dynamic navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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
      // Redirect is handled directly in the signOut thunk
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

  // Get base styles and dynamic classes
  const getBaseClasses = () => {
    const baseClasses = "fixed w-full top-0 z-50 transition-all duration-300";
    const variantClasses = {
      admin: "bg-gray-900 text-white border-b border-gray-800",
      client: "bg-white text-gray-900 border-b border-gray-100",
      default: "border-b"
    }[variant];

    const scrollClasses = isScrolled 
      ? "shadow-lg backdrop-blur-sm bg-opacity-90"
      : "";
    
    return `${baseClasses} ${variantClasses} ${scrollClasses}`;
  };

  // Dynamic text and background colors
  const getTextColor = (isActive: boolean) => {
    if (variant === 'admin') {
      return isActive ? 'text-blue-400 font-semibold' : 'text-gray-200 hover:text-white';
    }
    return isActive ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600';
  };

  const getBgColor = () => {
    if (variant === 'admin') {
      return isScrolled ? 'bg-gray-900/95' : 'bg-gray-900';
    }
    return isScrolled ? 'bg-white/95' : 'bg-white';
  };

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={navbarVariants}
      className={classNames(getBaseClasses(), getBgColor())}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and brand */}
          <motion.div
            className="flex flex-shrink-0 items-center"
            variants={navItemVariants}
          >
            {pathname === '/' ? (
              <div className="flex items-center" aria-label="Home">
                <Logo 
                  size="md"
                  textColor={variant === 'admin' ? 'text-white' : 'text-gray-900'}
                  animated={true}
                  href={undefined}
                />
              </div>
            ) : (
              <Link href="/" className="flex items-center" aria-label="Home">
                <Logo 
                  size="md"
                  textColor={variant === 'admin' ? 'text-white' : 'text-gray-900'}
                  animated={true}
                  href={undefined}
                />
              </Link>
            )}
          </motion.div>

          {/* Desktop navigation */}
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-0.5">
            <AnimatePresence>
              <motion.div
                variants={navItemVariants}
                className="flex space-x-0.5"
              >
                {navigation.map((item) => {
                  // Check if this is the current page
                  const isCurrent = 
                    (item.href === '/' && pathname === '/') || 
                    (item.href !== '/' && pathname.startsWith(item.href));
                    
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        getNavLinkClasses(isCurrent, variant)
                      )}
                      aria-current={isCurrent ? 'page' : undefined}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            {/* Contact Button */}
            <motion.div
              variants={navItemVariants}
              className="ml-3"
            >
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-blue-200 hover:border-blue-300 text-blue-600 hover:text-blue-700 flex items-center"
              >
                <Link href="/contact">
                  <Mail className="w-3.5 h-3.5 mr-1.5" />
                  <span>Custom Solutions</span>
                </Link>
              </Button>
            </motion.div>
          </div>

          <motion.div className="flex items-center space-x-3 md:space-x-4" variants={navItemVariants}>
            {/* Explore Services button (always visible) */}
            <Button 
              asChild 
              variant={variant === 'admin' ? 'secondary' : 'outline'}
              size="sm"
              className="text-sm font-medium hidden lg:flex items-center hover:shadow-sm transition-shadow"
            >
              <Link href={user ? "/client/services" : "/services-list"} className="flex items-center">
                <Briefcase className="w-4 h-4 mr-1.5 text-blue-500" />
                Explore Services
              </Link>
            </Button>

            {user ? (
              <Menu as="div" className="relative">
                <Menu.Button 
                  className={classNames(
                    "flex items-center space-x-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 p-1 hover:shadow-sm transition-all duration-200",
                    variant === 'admin' ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100'
                  )}
                >
                  <Avatar>
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                    <AvatarFallback className={variant === 'admin' ? 'bg-gray-700 text-white' : 'bg-blue-100 text-blue-800'}>
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className={classNames(
                    "hidden lg:block text-sm font-medium",
                    variant === 'admin' ? 'text-gray-200' : 'text-gray-700'
                  )}>
                    {user.displayName?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-current opacity-50" />
                </Menu.Button>
                
                <AnimatePresence>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={dropdownVariants}
                      >
                        {/* User info */}
                        <div className="border-b border-gray-100 px-4 py-3">
                          <p className="truncate text-sm font-medium text-gray-900">{user.displayName}</p>
                          <p className="truncate text-sm text-gray-500">{user.email}</p>
                        </div>

                        <div className="py-1">
                          {userMenuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Menu.Item key={item.name}>
                                {({ active }) => (
                                  <Link
                                    href={item.href}
                                    className={classNames(
                                      active ? 'bg-gray-50 text-blue-600' : 'text-gray-700',
                                      'flex items-center px-4 py-2 text-sm'
                                    )}
                                  >
                                    <Icon className="mr-3 h-4 w-4" />
                                    {item.name}
                                  </Link>
                                )}
                              </Menu.Item>
                            );
                          })}
    
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={handleSignOut}
                                disabled={signingOut || isLoading}
                                className={classNames(
                                  active ? 'bg-gray-50 text-red-600' : 'text-gray-700',
                                  (signingOut || isLoading) ? 'opacity-50 cursor-not-allowed' : '',
                                  'flex items-center w-full text-left px-4 py-2 text-sm'
                                )}
                              >
                                <LogOut className="mr-3 h-4 w-4" />
                                {signingOut ? 'Signing out...' : 'Sign out'}
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </motion.div>
                    </Menu.Items>
                  </Transition>
                </AnimatePresence>
              </Menu>
            ) : (
              <Button
                asChild
                variant="premium"
                size="sm"
                className="shadow-md hover:shadow-lg transition-shadow"
              >
                <Link href="/auth/sign-in" className="flex items-center">
                  <UserCircle2 className="w-4 h-4 mr-1.5" />
                  <span>Sign In</span>
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </motion.div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden space-x-2">
            {!user && (
              <Button
                asChild
                variant="premium"
                size="xs"
                className="mr-1"
              >
                <Link href="/auth/sign-in" className="flex items-center">
                  <UserCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  <span>Sign In</span>
                </Link>
              </Button>
            )}
            
            <button
              type="button"
              className={classNames(
                "inline-flex items-center justify-center rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500",
                variant === 'admin' 
                  ? 'text-gray-400 hover:bg-gray-700 hover:text-white' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-blue-600'
              )}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-5 w-5" aria-hidden="true" />
              ) : (
                <MenuIcon className="block h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={cn(
                "md:hidden overflow-hidden",
                getBgColor()
              )}
            >
              <motion.div 
                className="space-y-1 px-2 pb-3 pt-2"
                variants={navbarVariants}
                initial="hidden"
                animate="visible"
              >
                {navigation.map((item, index) => (
                  <motion.div
                    key={item.name}
                    variants={navItemVariants}
                    custom={index}
                  >
                    <Link
                      href={item.href}
                      className={classNames(
                        pathname === item.href 
                          ? `bg-blue-50 ${variant === 'admin' ? 'text-blue-500' : 'text-blue-600'}`
                          : `${variant === 'admin' ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`,
                        'block rounded-md px-3 py-2.5 text-base font-medium flex items-center'
                      )}
                    >
                      {item.icon && <item.icon className="w-5 h-5 mr-2 flex-shrink-0" />}
                      {item.name}
                    </Link>
                  </motion.div>
                ))}

                <motion.div variants={navItemVariants}>
                  <Link
                    href={user ? "/client/services" : "/services-list"}
                    className={classNames(
                      variant === 'admin' 
                        ? 'bg-gray-800 text-white hover:bg-gray-700' 
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100',
                      'flex items-center justify-between rounded-md px-3 py-2.5 text-base font-medium mt-4'
                    )}
                  >
                    <span className="flex items-center">
                      <Briefcase className="w-5 h-5 mr-2" />
                      Explore Services
                    </span>
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </motion.div>
              </motion.div>

              {/* User profile section in mobile menu */}
              {user && (
                <motion.div 
                  variants={navItemVariants}
                  className={classNames(
                    'border-t pt-4 pb-3 px-2',
                    variant === 'admin' ? 'border-gray-700' : 'border-gray-200'
                  )}
                >
                  <div className="flex items-center px-4">
                    <div className="flex-shrink-0">
                      <Avatar>
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                        <AvatarFallback className={variant === 'admin' ? 'bg-gray-700 text-white' : 'bg-blue-100 text-blue-800'}>
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="ml-3 overflow-hidden">
                      <div className={classNames(
                        "text-base font-medium truncate",
                        variant === 'admin' ? 'text-white' : 'text-gray-800'
                      )}>
                        {user.displayName}
                      </div>
                      <div className={classNames(
                        "text-sm font-medium truncate",
                        variant === 'admin' ? 'text-gray-400' : 'text-gray-500'
                      )}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 px-2">
                    {userMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={classNames(
                            'flex items-center rounded-md px-3 py-2.5 text-base font-medium',
                            variant === 'admin'
                              ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                          )}
                        >
                          <Icon className="mr-3 h-5 w-5" />
                          {item.name}
                        </Link>
                      );
                    })}
                    <button
                      onClick={handleSignOut}
                      disabled={signingOut || isLoading}
                      className={classNames(
                        'flex items-center rounded-md px-3 py-2.5 text-base font-medium w-full text-left',
                        variant === 'admin'
                          ? 'text-red-300 hover:bg-gray-700 hover:text-red-200'
                          : 'text-red-600 hover:bg-gray-50',
                        (signingOut || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
                      )}
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      {signingOut ? 'Signing out...' : 'Sign out'}
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
} 