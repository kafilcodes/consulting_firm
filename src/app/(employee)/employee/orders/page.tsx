'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import {
  getRecentOrders,
  type Order as OrderType,
} from '@/lib/firebase/services';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import {
  Search,
  FileText,
  MessageCircle,
  CheckCircle,
  XCircle,
  ClockIcon,
  AlertCircle,
  RefreshCw,
  Filter,
  ArrowUpDown,
  Calendar
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/radix-select';

export default function EmployeeOrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sortBy, setSortBy] = useState<'createdAt' | 'amount' | 'serviceName'>('createdAt');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // In a real implementation, we would filter by the current employee
        // For now, we'll get all orders
        const allOrders = await getRecentOrders(50);
        setOrders(allOrders);
        setFilteredOrders(allOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, [user]);

  // Apply filters, sorting and search
  useEffect(() => {
    let result = [...orders];
    
    // Filter by status tab
    if (activeTab !== 'all') {
      result = result.filter(order => {
        return order.status === activeTab;
      });
    }
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        (order.serviceName && order.serviceName.toLowerCase().includes(query)) ||
        (order.userName && order.userName.toLowerCase().includes(query)) ||
        (order.userEmail && order.userEmail.toLowerCase().includes(query)) ||
        (order.id && order.id.toLowerCase().includes(query)) ||
        (order.amount && order.amount.toString().includes(query))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let valA, valB;
      
      if (sortBy === 'createdAt') {
        valA = new Date(a.createdAt as string).getTime();
        valB = new Date(b.createdAt as string).getTime();
      } else if (sortBy === 'amount') {
        valA = a.amount || 0;
        valB = b.amount || 0;
      } else {
        valA = a.serviceName || '';
        valB = b.serviceName || '';
      }
      
      if (sortOrder === 'asc') {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });
    
    setFilteredOrders(result);
  }, [orders, activeTab, searchQuery, sortBy, sortOrder]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'confirmed':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-purple-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1.5">
            <ClockIcon className="h-3 w-3" /> Pending
          </Badge>
        );
      case 'confirmed':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1.5">
            <Calendar className="h-3 w-3" /> Confirmed
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1.5">
            <RefreshCw className="h-3 w-3" /> Processing
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1.5">
            <CheckCircle className="h-3 w-3" /> Completed
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1.5">
            <XCircle className="h-3 w-3" /> Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Skeleton className="h-10 w-full" />
        
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders Management</h1>
          <p className="text-muted-foreground">
            View and manage all client orders
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select
            value={sortBy}
            onValueChange={(value: string) => setSortBy(value as 'createdAt' | 'amount' | 'serviceName')}
                >
            <SelectTrigger className="w-[130px]">
              <span className="flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" />
                <span>Sort by</span>
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Date</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
              <SelectItem value="serviceName">Service</SelectItem>
            </SelectContent>
          </Select>
          
                          <Button
                            variant="outline"
            size="icon"
            onClick={toggleSortOrder}
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                          >
            <ArrowUpDown className={`h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180 transform' : ''}`} />
                          </Button>
                        </div>
              </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No orders found</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery ? 'No orders match your search criteria.' : 'There are no orders in this category at the moment.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card 
                  key={order.id} 
                  className="overflow-hidden cursor-pointer transition-all hover:shadow-md"
                  onClick={() => router.push(`/employee/orders/${order.id}`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          {order.serviceName}
                        </CardTitle>
                        <CardDescription>Order #{order.id?.substring(0, 8)}</CardDescription>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Client</p>
                        <p>{order.userName}</p>
                        <p className="text-sm text-muted-foreground">{order.userEmail}</p>
            </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Details</p>
                        <p className="font-medium">{formatCurrency(order.amount, order.currency)}</p>
                        <p className="text-sm text-muted-foreground">
                          Created: {new Date(order.createdAt as string).toLocaleDateString()}
              </p>
            </div>
          </div>
                  </CardContent>
                  <CardFooter className="bg-muted/50 pt-2">
                    <div className="flex justify-between items-center w-full">
                      <p className="text-sm text-muted-foreground">
                        Payment: <span className={order.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'}>
                          {order.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
                        </span>
                      </p>
            <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click from firing
                          router.push(`/employee/orders/${order.id}`);
                        }}
            >
                        <FileText className="h-4 w-4" />
                        View Details
            </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 