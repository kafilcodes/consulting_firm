'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Logo } from '@/components/logo';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Settings, 
  MessageSquare, 
  Tag, 
  FileText, 
  ChevronLeft,
  ChevronRight,
  Menu,
  LogOut 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface SidebarNavProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, userRole, isLoading, signOut } = useAuth();
  const [isClient, setIsClient] = useState(false);

  // Mark as client-side rendered
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Loading state
  if (!isClient || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  // Don't render anything if not an admin
  if (!user || userRole !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      <SidebarNav collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <main className="flex-1 bg-gray-50 dark:bg-gray-950 p-4 md:p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

function SidebarNav({ collapsed, setCollapsed }: SidebarNavProps) {
  const pathname = usePathname();

  // Nav items
  const navItems = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: <LayoutDashboard className="h-5 w-5" />,
      exact: true,
    },
    {
      title: 'Orders',
      href: '/admin/orders',
      icon: <ShoppingBag className="h-5 w-5" />,
    },
    {
      title: 'Employees',
      href: '/admin/employees',
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: 'Services',
      href: '/admin/services',
      icon: <Tag className="h-5 w-5" />,
    },
    {
      title: 'Feedback',
      href: '/admin/feedback',
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      title: 'Reports',
      href: '/admin/reports',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: 'Settings',
      href: '/admin/settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const isActiveLink = (item: { href: string, exact?: boolean }) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <div
      className={`bg-white dark:bg-gray-900 h-screen flex flex-col border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-800">
        <div className={`flex items-center ${collapsed ? 'justify-center w-full' : ''}`}>
          {collapsed ? (
            <Logo collapsed />
          ) : (
            <Link href="/admin" className="flex items-center">
              <Logo />
              <span className="ml-2 text-lg font-bold">Admin Portal</span>
            </Link>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={`ml-auto ${collapsed ? 'hidden md:flex' : ''}`}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 pt-4">
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                isActiveLink(item)
                  ? 'bg-gray-100 dark:bg-gray-800 text-primary'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {item.icon}
              <span className={`${collapsed ? 'hidden' : 'block'}`}>{item.title}</span>
            </Link>
          ))}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <Button
          variant="ghost"
          className={`w-full flex items-center gap-2 justify-${collapsed ? 'center' : 'start'}`}
          onClick={() => signOut()}
        >
          <LogOut className="h-5 w-5" />
          <span className={collapsed ? 'hidden' : 'block'}>Sign Out</span>
        </Button>
      </div>
      
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 md:hidden"
        onClick={() => setCollapsed(!collapsed)}
      >
        <Menu className="h-6 w-6" />
      </Button>
    </div>
  );
} 