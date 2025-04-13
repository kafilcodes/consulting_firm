'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Settings,
  MessageSquare,
  Package,
  FileText,
  BarChart,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Clients', href: '/admin/clients', icon: Users },
  { name: 'Services', href: '/admin/services', icon: Package },
  { name: 'Chat', href: '/admin/chat', icon: MessageSquare },
  { name: 'Reports', href: '/admin/reports', icon: BarChart },
  { name: 'Documents', href: '/admin/documents', icon: FileText },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-grow flex-col overflow-y-auto bg-gray-900 pt-5">
        <div className="flex flex-shrink-0 items-center px-4">
          <Link href="/admin" className="flex items-center">
            <Image
              src="/images/logo/sks_logo.png"
              alt="SKS Admin"
              width={45}
              height={45}
              className="h-9 w-auto mr-2"
              priority
            />
            <span className="text-lg font-bold text-white">
              SKS Admin
            </span>
          </Link>
        </div>
        <nav className="mt-5 flex-1 space-y-1 px-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  pathname === item.href
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon
                  className={`mr-3 h-6 w-6 flex-shrink-0 ${
                    pathname === item.href
                      ? 'text-white'
                      : 'text-gray-400 group-hover:text-gray-300'
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
} 