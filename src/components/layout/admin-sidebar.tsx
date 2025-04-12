'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { 
  BarChart, 
  Users, 
  FileText, 
  Calendar, 
  Settings, 
  HelpCircle,
  Layout,
  MessagesSquare,
  BriefcaseIcon
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAppSelector(state => state.auth);
  
  // Define navigation items for admin roles
  const navItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <Layout className="mr-2 h-4 w-4" />
    },
    {
      title: 'Analytics',
      href: '/analytics',
      icon: <BarChart className="mr-2 h-4 w-4" />
    },
    {
      title: 'Clients',
      href: '/clients',
      icon: <Users className="mr-2 h-4 w-4" />
    },
    {
      title: 'Projects',
      href: '/projects',
      icon: <BriefcaseIcon className="mr-2 h-4 w-4" />
    },
    {
      title: 'Documents',
      href: '/documents',
      icon: <FileText className="mr-2 h-4 w-4" />
    },
    {
      title: 'Schedule',
      href: '/schedule',
      icon: <Calendar className="mr-2 h-4 w-4" />
    },
    {
      title: 'Messages',
      href: '/messages',
      icon: <MessagesSquare className="mr-2 h-4 w-4" />
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: <Settings className="mr-2 h-4 w-4" />
    },
    {
      title: 'Help',
      href: '/help',
      icon: <HelpCircle className="mr-2 h-4 w-4" />
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center">
          <div className="w-8 h-8 mr-2 rounded-md bg-primary flex items-center justify-center text-white font-semibold">
            SK
          </div>
          <span className="text-lg font-semibold">SKS Consulting</span>
        </Link>
      </div>
      
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
              pathname === item.href
                ? "bg-primary/10 text-primary"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            {item.icon}
            {item.title}
          </Link>
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-3">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
            ) : (
              <Icons.user className="h-5 w-5 text-gray-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.displayName || 'Admin User'}
            </p>
            <p className="text-xs text-gray-500 truncate capitalize">
              {user?.role || 'admin'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
} 