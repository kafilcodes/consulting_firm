'use client';

import React from 'react'
import { ClientSidebar } from './client-sidebar'
import { Navbar } from './navbar'
import { motion } from 'framer-motion'
import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BaseLayout } from './base-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';
import {
  LayoutDashboard,
  Briefcase,
  CalendarCheck,
  Receipt,
  Clock,
  FileText,
  MessageSquare,
  User,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Navigation items for the client dashboard
const navigation = [
  { name: 'Dashboard', href: '/client', icon: LayoutDashboard },
  { name: 'Projects', href: '/client/projects', icon: Briefcase },
  { name: 'Appointments', href: '/client/appointments', icon: CalendarCheck },
  { name: 'Invoices', href: '/client/invoices', icon: Receipt },
  { name: 'Time Reports', href: '/client/time-reports', icon: Clock },
  { name: 'Documents', href: '/client/documents', icon: FileText },
  { name: 'Messages', href: '/client/messages', icon: MessageSquare },
  { name: 'Profile', href: '/client/profile', icon: User },
  { name: 'Support', href: '/client/support', icon: HelpCircle },
];

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true)

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <ClientSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar toggleSidebar={toggleSidebar} />
        
        <motion.main 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="relative flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6"
        >
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  )
}

// Helper component for sidebar links
interface SidebarLinkProps {
  item: { name: string; href: string; icon: React.ComponentType<any> };
  pathname: string;
}

function SidebarLink({ item, pathname }: SidebarLinkProps) {
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;
  
  return (
    <Link
      href={item.href}
      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
        isActive
          ? 'bg-gray-100 text-blue-600'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon
        className={`mr-3 flex-shrink-0 h-5 w-5 ${
          isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
        }`}
        aria-hidden="true"
      />
      {item.name}
    </Link>
  );
} 