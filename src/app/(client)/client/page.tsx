'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  BarChart, 
  FileText, 
  Clock, 
  AlertCircle,
  ShoppingBag,
  CheckCircle,
  User,
  Briefcase
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { getClientOrders, getServices } from '@/lib/firebase/services';
import { Service, Order } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

// Featured service categories with icons
const serviceCategories = [
  {
    title: 'CA Services',
    description: 'Expert Chartered Accountant services for your business needs.',
    href: '/client/services?category=ca-services',
    icon: FileText,
    color: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    title: 'Audit Services',
    description: 'Comprehensive audit solutions to ensure compliance and growth.',
    href: '/client/services?category=audit',
    icon: BarChart,
    color: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    title: 'Tax Services',
    description: 'Professional tax planning and filing services.',
    href: '/client/services?category=tax',
    icon: Briefcase,
    color: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    title: 'Business Registration',
    description: 'Streamlined company registration and compliance services.',
    href: '/client/services?category=registration',
    icon: CheckCircle,
    color: 'bg-green-100',
    iconColor: 'text-green-600',
  },
];

export default function ClientDashboard() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recommendedServices, setRecommendedServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
    <div className="bg-gray-50 min-h-screen">
      {/* Welcome Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="md:flex md:items-center md:justify-between"
          >
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Welcome back, {user?.displayName?.split(' ')[0] || 'Client'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your services and track your orders from your personal dashboard.
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Button asChild>
                <Link href="/client/services" className="flex items-center">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Browse Services
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="col-span-full lg:col-span-1"
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Your Overview</CardTitle>
                <CardDescription>A summary of your account activity</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <ShoppingBag className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">Active Orders</p>
                      <p className="text-2xl font-bold">
                        {isLoading ? (
                          <span className="inline-block w-8 h-6 bg-gray-200 animate-pulse rounded" />
                        ) : (
                          recentOrders.filter(order => 
                            order.status === 'pending' || order.status === 'in-progress'
                          ).length
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 p-2 rounded-full">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">Completed Orders</p>
                      <p className="text-2xl font-bold">
                        {isLoading ? (
                          <span className="inline-block w-8 h-6 bg-gray-200 animate-pulse rounded" />
                        ) : (
                          recentOrders.filter(order => order.status === 'completed').length
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <User className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">Account Status</p>
                      <p className="text-sm font-medium text-green-600 mt-1">Active</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/client/profile">
                    View Profile
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="col-span-full lg:col-span-2"
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Track your latest service requests</CardDescription>
                  </div>
                  <Button variant="outline" asChild size="sm">
                    <Link href="/client/orders">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-20 rounded-lg bg-gray-200 animate-pulse" />
                    ))}
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No Orders Yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Start by browsing our services and placing your first order.
                    </p>
                    <div className="mt-6">
                      <Button asChild>
                        <Link href="/client/services">Browse Services</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div 
                        key={order.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Order #{order.id.slice(-6)}</p>
                            <p className="text-sm text-gray-500">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusBadgeClass(order.status)}`}>
                            {order.status}
                          </span>
                          <Link href={`/client/orders/${order.id}`} className="ml-4 text-blue-600 hover:text-blue-800">
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Service Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Explore Our Services</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {serviceCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Card 
                  key={category.title}
                  className="overflow-hidden transition-all duration-200 hover:shadow-md"
                >
                  <CardHeader className={`pb-2 ${category.color}`}>
                    <div className="flex items-center">
                      <Icon className={`h-6 w-6 mr-2 ${category.iconColor}`} />
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {category.description}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" asChild className="w-full">
                      <Link href={category.href} className="flex items-center justify-center">
                        Explore
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* Recommended Services */}
        {recommendedServices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recommended for You</h2>
              <Link 
                href="/client/services" 
                className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
              >
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <Card key={i} className="bg-gray-200 animate-pulse h-64" />
                ))
              ) : (
                recommendedServices.map((service) => (
                  <Card key={service.id} className="overflow-hidden transition-all duration-200 hover:shadow-md">
                    <div className="relative h-40 w-full bg-gray-100">
                      {service.image ? (
                        <Image
                          src={service.image}
                          alt={service.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-blue-50">
                          <Briefcase className="h-12 w-12 text-blue-300" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-gray-900 line-clamp-1">{service.name}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {service.shortDescription}
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm font-medium text-gray-900">
                          ₹{service.price.amount.toLocaleString()}
                          <span className="text-xs text-gray-500 ml-1">
                            {service.price.billingType !== 'one-time' ? `/${service.price.billingType}` : ''}
                          </span>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/client/services/${service.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 