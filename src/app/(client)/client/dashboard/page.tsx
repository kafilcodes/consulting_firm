'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FileText, 
  User, 
  Calendar, 
  ShoppingBag, 
  ChevronRight,
  Clock,
  Loader2,
  AlertCircle,
  TrendingUp,
  CreditCard
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/store/hooks';
import { getClientOrders } from '@/lib/firebase/services';
import { UserRole, Order } from '@/types';
import { toast } from 'sonner';

// Enhanced animation variants for a more premium feel
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.12,
      duration: 0.6
    }
  }
};

const itemVariants = {
  hidden: { y: 25, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 80,
      damping: 12
    }
  }
};

// Hero section animation
const heroVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      delay: 0.1,
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1.0],
    }
  }
};

export default function ClientDashboard() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  
  // Fetch client data on component mount
  useEffect(() => {
    async function fetchClientData() {
      if (!user?.uid) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch recent orders
        const orders = await getClientOrders(user.uid);
        setRecentOrders(orders.slice(0, 3)); // Only show 3 most recent orders
      } catch (err) {
        console.error('Error fetching client data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        toast.error('Error loading dashboard data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchClientData();
  }, [user?.uid]);

  // Redirect if not logged in or not a client
  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }
    
    if (user.role !== 'client') {
      router.push('/unauthorized');
    }
  }, [user, router]);

  // Format date for display
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  // Status badge styling
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // If still checking auth or loading data
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-14 w-14 animate-spin mx-auto text-primary mb-6" />
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="rounded-lg bg-red-50 p-8 flex items-center space-x-6 max-w-3xl mx-auto shadow-sm border border-red-100">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <div>
            <h3 className="text-xl font-medium text-red-800 mb-2">Error Loading Dashboard</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.location.reload()}
              className="font-medium"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-8"
        >
          {/* Hero Welcome Section with enhanced styling */}
          <motion.div 
            variants={heroVariants}
            className="bg-white rounded-2xl shadow-md p-8 mb-10 border border-gray-100"
          >
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Welcome back, {user.displayName || 'Client'}
              </h1>
              <p className="text-gray-600 text-lg">
                Here's an overview of your account and services
              </p>
            </div>
          </motion.div>

          {/* Quick Stats - Redesigned with better visuals */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="flex flex-row items-center p-6">
                  <div className="p-3 bg-blue-100 rounded-full mr-4 text-blue-600">
                    <ShoppingBag className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Active Orders</p>
                    <h3 className="text-3xl font-bold text-gray-900">
                      {recentOrders.filter(o => o.status === 'pending' || o.status === 'in-progress').length}
                    </h3>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-indigo-50 to-white">
                <CardContent className="flex flex-row items-center p-6">
                  <div className="p-3 bg-indigo-100 rounded-full mr-4 text-indigo-600">
                    <Calendar className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Meetings</p>
                    <h3 className="text-3xl font-bold text-gray-900">0</h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-emerald-50 to-white">
                <CardContent className="flex flex-row items-center p-6">
                  <div className="p-3 bg-emerald-100 rounded-full mr-4 text-emerald-600">
                    <TrendingUp className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <h3 className="text-3xl font-bold text-gray-900">Active</h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-50 to-white">
                <CardContent className="flex flex-row items-center p-6">
                  <div className="p-3 bg-purple-100 rounded-full mr-4 text-purple-600">
                    <CreditCard className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Payments</p>
                    <h3 className="text-3xl font-bold text-gray-900">--</h3>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Main Dashboard Content - Enhanced Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Expanded for better use of space */}
            <motion.div variants={itemVariants} className="xl:col-span-2 space-y-8">
              {/* Recent Orders - Enhanced Card */}
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 p-6">
                  <CardTitle className="flex items-center text-xl font-bold">
                    <ShoppingBag className="mr-3 h-6 w-6 text-blue-600" />
                    Recent Orders
                  </CardTitle>
                  <CardDescription className="text-gray-500">Your recent service orders and their status</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {recentOrders.length > 0 ? (
                    <div className="space-y-4">
                      {recentOrders.map((order, index) => (
                        <motion.div 
                          key={order.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-4 ${
                              order.status === 'completed' ? 'bg-green-500' : 
                              order.status === 'in-progress' ? 'bg-blue-500' : 'bg-yellow-500'
                            }`}></div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Order #{order.id.slice(-6)}</h4>
                              <div className="flex text-xs text-gray-500 mt-1">
                                <span>Created on {formatDate(order.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Badge 
                              variant="outline"
                              className={`capitalize px-3 py-1 text-xs font-medium ${getStatusBadgeClass(order.status)}`}
                            >
                              {order.status}
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="ml-3 rounded-full"
                              asChild
                            >
                              <Link href={`/client/orders/${order.id}`}>
                                <ChevronRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 px-4">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-700 mb-2">No orders yet</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">Start exploring our services and place your first order to see it here</p>
                        <Button variant="default" size="lg" asChild className="rounded-full px-6">
                          <Link href="/client/services">Browse Services</Link>
                        </Button>
                      </motion.div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="justify-end border-t border-gray-100 bg-gray-50 p-4">
                  <Button variant="ghost" asChild className="text-blue-600 font-medium">
                    <Link href="/client/orders" className="flex items-center">
                      View all orders <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Upcoming Appointments - Enhanced Card */}
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 p-6">
                  <CardTitle className="flex items-center text-xl font-bold">
                    <Calendar className="mr-3 h-6 w-6 text-indigo-600" />
                    Upcoming Appointments
                  </CardTitle>
                  <CardDescription className="text-gray-500">Your scheduled meetings with consultants</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center py-12 px-4">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-gray-700 mb-2">No upcoming appointments</h3>
                      <p className="text-gray-500 mb-6 max-w-md mx-auto">Schedule consultations with our experts to discuss your business needs</p>
                      <Button variant="default" size="lg" asChild className="rounded-full px-6">
                        <Link href="/client/services">Schedule a Consultation</Link>
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end border-t border-gray-100 bg-gray-50 p-4">
                  <Button variant="ghost" asChild className="text-indigo-600 font-medium">
                    <Link href="/client/appointments" className="flex items-center">
                      View all appointments <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>

            {/* Right Column - Quick Actions */}
            <motion.div variants={itemVariants} className="space-y-8">
              {/* Quick Actions - Enhanced Card */}
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 p-6">
                  <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
                  <CardDescription className="text-gray-500">Common tasks you may want to perform</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Button variant="outline" size="lg" className="w-full justify-start h-14 text-base font-medium hover:bg-blue-50 hover:text-blue-700 transition-all border-gray-200" asChild>
                      <Link href="/client/services" className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-full mr-3 text-blue-600">
                          <ShoppingBag className="h-5 w-5" />
                        </div>
                        Browse Services
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" className="w-full justify-start h-14 text-base font-medium hover:bg-indigo-50 hover:text-indigo-700 transition-all border-gray-200" asChild>
                      <Link href="/client/orders" className="flex items-center">
                        <div className="p-2 bg-indigo-100 rounded-full mr-3 text-indigo-600">
                          <FileText className="h-5 w-5" />
                        </div>
                        View Orders
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" className="w-full justify-start h-14 text-base font-medium hover:bg-purple-50 hover:text-purple-700 transition-all border-gray-200" asChild>
                      <Link href="/client/profile" className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-full mr-3 text-purple-600">
                          <User className="h-5 w-5" />
                        </div>
                        Update Profile
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Help & Support Card */}
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
                    <p className="text-gray-600 mb-4">Our support team is here to assist you with any questions</p>
                    <Button className="w-full rounded-full" size="lg" asChild>
                      <Link href="/client/support">Contact Support</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 