'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { getRecentOrders, getUser } from '@/lib/firebase/services';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import {
  LayoutDashboard,
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  ChevronRight,
  Briefcase
} from 'lucide-react';

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [employeeProfile, setEmployeeProfile] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Fetch orders
        const orders = await getRecentOrders(10);
        
        // Filter orders assigned to this employee 
        // In a real implementation, you would have a proper employeeId field to filter on
        // For now, we'll assume all orders are available to this employee
        setRecentOrders(orders);
        
        // Calculate stats
        const pendingOrders = orders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.status)).length;
        const completedOrders = orders.filter(o => o.status === 'completed').length;
        const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
        
        setStats({
          pendingOrders,
          completedOrders,
          cancelledOrders,
        });
        
        // Fetch employee profile
        const employeeData = await getUser(user.uid);
        setEmployeeProfile(employeeData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between items-center border-b pb-2">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Confirmed</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Processing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {employeeProfile?.displayName || "Employee"}</h1>
          <p className="text-muted-foreground">
            Here's a summary of your work and assignments
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/employee/orders')}>
            <ClipboardList className="h-4 w-4 mr-2" />
            View All Orders
          </Button>
        </div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.completedOrders}</div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cancelled Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.cancelledOrders}</div>
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders assigned for processing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{order.serviceName}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{order.userName}</span>
                        <span>{formatCurrency(order.amount, order.currency)}</span>
                        <span>
                          {new Date(order.createdAt as string).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/employee/orders/${order.id}`)}
                      className="gap-1"
                    >
                      View Details
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="mt-2">No recent orders found</p>
                </div>
              )}
            </div>
          </CardContent>
          {recentOrders.length > 0 && (
            <CardFooter className="justify-center border-t pt-4">
              <Button variant="outline" onClick={() => router.push('/employee/orders')}>
                View All Orders
              </Button>
            </CardFooter>
          )}
        </Card>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Button variant="outline" className="h-auto py-4 w-full flex flex-col items-center justify-center gap-2" 
                onClick={() => router.push('/employee/orders')}>
                <ClipboardList className="h-6 w-6" />
                <span>Manage Orders</span>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Important Reminders</CardTitle>
            <CardDescription>Tasks that need your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.filter(o => o.status === 'pending' || o.status === 'confirmed').length > 0 ? (
                recentOrders
                  .filter(o => o.status === 'pending' || o.status === 'confirmed')
                  .slice(0, 3)
                  .map((order) => (
                    <div key={order.id} className="flex items-start gap-3 border-b pb-3">
                      <div className="bg-yellow-100 text-yellow-700 p-2 rounded-full">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="font-medium">{order.serviceName} needs your attention</div>
                        <div className="text-sm text-muted-foreground">
                          From {order.userName} - {new Date(order.createdAt as string).toLocaleDateString()}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/employee/orders/${order.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-8 w-8 mx-auto text-green-500" />
                  <p className="mt-2">No pending tasks</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 