'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FileText, 
  User, 
  PieChart, 
  Calendar, 
  ShoppingBag, 
  Bell, 
  ChevronRight,
  Clock,
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/store/hooks';
import { getClientOrders, getServices } from '@/lib/firebase/services';
import { UserRole, Order, Service } from '@/types';
import { toast } from 'sonner';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 100,
      damping: 10
    }
  }
};

export default function ClientDashboard() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recommendedServices, setRecommendedServices] = useState<Service[]>([]);
  
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
        
        // Fetch recommended services
        const allServices = await getServices();
        // Filter or sort services based on client's profile or previous orders
        // For now, just show some random services as recommendations
        setRecommendedServices(allServices.slice(0, 3));
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="rounded-lg bg-red-50 p-6 flex items-center space-x-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <div>
            <h3 className="text-lg font-medium text-red-800">Error Loading Dashboard</h3>
            <p className="text-red-700 mt-1">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        {/* Welcome Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome back, {user.displayName || 'Client'}
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's an overview of your account and services
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="flex flex-row items-center p-6">
                <div className="p-2 bg-primary/10 rounded-full mr-4">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Orders</p>
                  <h3 className="text-2xl font-bold">
                    {recentOrders.filter(o => o.status === 'pending' || o.status === 'in-progress').length}
                  </h3>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex flex-row items-center p-6">
                <div className="p-2 bg-primary/10 rounded-full mr-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Upcoming Meetings</p>
                  <h3 className="text-2xl font-bold">0</h3>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex flex-row items-center p-6">
                <div className="p-2 bg-primary/10 rounded-full mr-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Documents</p>
                  <h3 className="text-2xl font-bold">-</h3>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Recent Orders
                </CardTitle>
                <CardDescription>Your recent service orders and their status</CardDescription>
              </CardHeader>
              <CardContent>
                {recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-3 ${
                            order.status === 'completed' ? 'bg-green-500' : 
                            order.status === 'in-progress' ? 'bg-blue-500' : 'bg-yellow-500'
                          }`}></div>
                          <div>
                            <h4 className="font-medium">Order #{order.id.slice(-6)}</h4>
                            <div className="flex text-xs text-muted-foreground">
                              <span>Created on {formatDate(order.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant="outline"
                            className={`capitalize ${getStatusBadgeClass(order.status)}`}
                          >
                            {order.status}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="ml-2"
                            asChild
                          >
                            <Link href={`/client/orders/${order.id}`}>
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Clock className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No orders yet</p>
                    <Button variant="link" asChild className="mt-2">
                      <Link href="/client/services">Browse Services</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter className="justify-end">
                <Button variant="ghost" asChild>
                  <Link href="/client/orders">
                    View all orders <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Upcoming Appointments
                </CardTitle>
                <CardDescription>Your scheduled meetings with consultants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <Clock className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No upcoming appointments</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link href="/client/services">Schedule a Consultation</Link>
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button variant="ghost" asChild>
                  <Link href="/client/appointments">
                    View all appointments <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Right Column */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks you may want to perform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/client/services">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Browse Services
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/client/documents">
                    <FileText className="mr-2 h-4 w-4" />
                    Manage Documents
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/client/profile">
                    <User className="mr-2 h-4 w-4" />
                    Update Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recommended Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="mr-2 h-5 w-5" />
                  Recommended Services
                </CardTitle>
                <CardDescription>Services you might be interested in</CardDescription>
              </CardHeader>
              <CardContent>
                {recommendedServices.length > 0 ? (
                  <div className="space-y-4">
                    {recommendedServices.map((service) => (
                      <div key={service.id} className="p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{service.name}</h4>
                          <div className="font-medium">₹{service.price.amount.toLocaleString()}</div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {service.shortDescription}
                        </p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-full"
                          asChild
                        >
                          <Link href={`/client/services/${service.id}`}>
                            View Details <ExternalLink className="ml-2 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">No recommendations yet</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="justify-end">
                <Button variant="ghost" asChild>
                  <Link href="/client/services">
                    View all services <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5" />
                  Recent Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No notifications</p>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button variant="ghost" size="sm">
                  See all notifications
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
} 