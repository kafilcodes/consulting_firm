'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  FileText, 
  User, 
  PieChart, 
  Calendar, 
  ShoppingBag, 
  Bell, 
  ChevronRight,
  Clock
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppSelector } from '@/store/hooks';
import { UserRole } from '@/types/auth';

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

// Mock data for recent orders
const recentOrders = [
  {
    id: 'ORD-123456',
    serviceName: 'Business Consultation',
    date: '2023-11-10',
    status: 'Completed',
    amount: 299.99
  },
  {
    id: 'ORD-789012',
    serviceName: 'Market Analysis',
    date: '2023-11-05',
    status: 'In Progress',
    amount: 499.99
  },
  {
    id: 'ORD-345678',
    serviceName: 'Financial Planning',
    date: '2023-10-30',
    status: 'Completed',
    amount: 349.99
  }
];

// Mock data for upcoming appointments
const upcomingAppointments = [
  {
    id: 'APT-123456',
    title: 'Business Strategy Review',
    consultant: 'John Smith',
    date: '2023-11-15',
    time: '10:00 AM'
  },
  {
    id: 'APT-789012',
    title: 'Quarterly Financial Check-in',
    consultant: 'Emma Johnson',
    date: '2023-11-20',
    time: '02:30 PM'
  }
];

// Mock data for recommended services
const recommendedServices = [
  {
    id: 'SRV-1',
    name: 'Strategic Business Planning',
    description: 'Long-term business strategy development',
    price: 799.99,
    imageUrl: '/images/services/strategic-planning.jpg'
  },
  {
    id: 'SRV-2',
    name: 'Tax Optimization',
    description: 'Minimize tax liability while ensuring compliance',
    price: 499.99,
    imageUrl: '/images/services/tax-optimization.jpg'
  },
  {
    id: 'SRV-3',
    name: 'Market Expansion Strategy',
    description: 'Analyze and plan market growth opportunities',
    price: 649.99,
    imageUrl: '/images/services/market-expansion.jpg'
  }
];

export default function ClientDashboard() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Redirect if not logged in or not a client
  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }
    
    if (user.role !== UserRole.CLIENT) {
      router.push('/unauthorized');
    }
  }, [user, router]);

  // If still checking auth or loading data
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleAddToCart = (service: any) => {
    router.push(`/client/checkout?serviceId=${service.id}`);
  };

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="flex flex-row items-center p-6">
                <div className="p-2 bg-primary/10 rounded-full mr-4">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Orders</p>
                  <h3 className="text-2xl font-bold">{recentOrders.filter(o => o.status === 'In Progress').length}</h3>
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
                  <h3 className="text-2xl font-bold">{upcomingAppointments.length}</h3>
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
                  <h3 className="text-2xl font-bold">12</h3>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex flex-row items-center p-6">
                <div className="p-2 bg-primary/10 rounded-full mr-4">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cart Items</p>
                  <h3 className="text-2xl font-bold">0</h3>
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
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 ${
                          order.status === 'Completed' ? 'bg-green-500' : 
                          order.status === 'In Progress' ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}></div>
                        <div>
                          <h4 className="font-medium">{order.serviceName}</h4>
                          <div className="flex text-xs text-muted-foreground">
                            <span>{order.id}</span>
                            <span className="mx-2">•</span>
                            <span>{order.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${order.amount.toFixed(2)}</div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                          order.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button variant="ghost" asChild>
                  <Link href="/orders">
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
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                      <div className="flex items-center">
                        <div className="p-2 bg-primary/10 rounded-full mr-3">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{appointment.title}</h4>
                          <div className="text-xs text-muted-foreground">
                            <span>With {appointment.consultant}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{appointment.date}</div>
                        <span className="text-xs text-muted-foreground">{appointment.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button variant="ghost" asChild>
                  <Link href="/appointments">
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
                  <Link href="/services-public">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Browse Services
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/cart">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    View Cart
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/documents">
                    <FileText className="mr-2 h-4 w-4" />
                    Manage Documents
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/profile">
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
                <div className="space-y-4">
                  {recommendedServices.map((service) => (
                    <div key={service.id} className="p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{service.name}</h4>
                        <div className="font-medium">${service.price.toFixed(2)}</div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                      <Button 
                        size="sm" 
                        onClick={() => handleAddToCart(service)}
                        className="w-full"
                      >
                        Add to Cart
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button variant="ghost" asChild>
                  <Link href="/services-public">
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
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-sm font-medium">Your Quarterly Financial Review is due</p>
                    <p className="text-xs text-muted-foreground mt-1">2 days ago</p>
                  </div>
                  <div className="p-3 rounded-lg bg-accent/50">
                    <p className="text-sm font-medium">New tax planning services available</p>
                    <p className="text-xs text-muted-foreground mt-1">1 week ago</p>
                  </div>
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