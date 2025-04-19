'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User,
  Bell,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Home,
  Package,
  FileText,
  HelpCircle,
  Settings
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { signOut } from '@/store/slices/authSlice';
import { toast } from 'sonner';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

// Navigation items with icons
const navigation = [
  { name: 'Dashboard', href: '/client/dashboard', icon: Home },
  { name: 'Services', href: '/client/services', icon: Package },
  { name: 'Orders', href: '/client/orders', icon: FileText },
  { name: 'Support', href: '/client/support', icon: HelpCircle },
];

export function ClientNavbar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      toast.loading('Signing out...', { id: 'signout' });
      await dispatch(signOut()).unwrap();
      toast.success('Successfully signed out', { id: 'signout' });
      // Redirect will be handled by middleware
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out. Please try again.', { id: 'signout' });
    } finally {
      setSigningOut(false);
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.displayName) return 'U';
    return user.displayName
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full transition-all duration-200",
      isScrolled ? "bg-white/95 backdrop-blur-sm shadow-md" : "bg-white"
    )}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/client" className="flex items-center">
                <Image
                  src="/images/logo/sks_logo.png"
                  alt="SKS Consulting Logo"
                  width={40}
                  height={40}
                  className="h-9 w-auto mr-2"
                  priority
                />
                <span className="text-lg font-bold hidden sm:inline-block text-gray-800">
                  SKS Consulting
                </span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
                      isActive 
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                    )}
                  >
                    <Icon className="h-4 w-4 mr-1.5" />
                    {item.name}
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                        layoutId="navbar-indicator"
                        transition={{ type: 'spring', duration: 0.5 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* Desktop Right section */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-2">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5 text-gray-600" />
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center">
                    2
                  </Badge>
                  <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
                  <div className="p-3 hover:bg-gray-50 cursor-pointer">
                    <p className="text-sm font-medium">Your order #12345 has been processed</p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                  <div className="p-3 hover:bg-gray-50 cursor-pointer">
                    <p className="text-sm font-medium">New service available: Tax Planning</p>
                    <p className="text-xs text-gray-500 mt-1">Yesterday</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-blue-600 cursor-pointer">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* User Profile */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-1">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                        <AvatarFallback className="bg-blue-100 text-blue-800">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-700 hidden md:block">
                        {user.displayName?.split(' ')[0]}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
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
                  <DropdownMenuItem asChild>
                    <Link href="/client/profile" className="flex cursor-pointer items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/client/orders" className="flex cursor-pointer items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>My Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/client/settings" className="flex cursor-pointer items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
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
            ) : (
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/auth/sign-in">Sign In</Link>
              </Button>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="block h-6 w-6 text-gray-600" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden overflow-hidden bg-white border-b"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "block px-3 py-2 rounded-md text-base font-medium flex items-center",
                      pathname === item.href
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                    )}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
            
            {user && (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-4 py-2">
                  <div className="flex-shrink-0">
                    <Avatar>
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                      <AvatarFallback className="bg-blue-100 text-blue-800">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user.displayName}</div>
                    <div className="text-sm font-medium text-gray-500 truncate max-w-[200px]">{user.email}</div>
                  </div>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <Link
                    href="/client/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600 flex items-center"
                  >
                    <User className="h-5 w-5 mr-3" />
                    Profile
                  </Link>
                  <Link
                    href="/client/settings"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600 flex items-center"
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-50 hover:text-red-700 flex items-center"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    {signingOut ? 'Signing out...' : 'Sign out'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
} 