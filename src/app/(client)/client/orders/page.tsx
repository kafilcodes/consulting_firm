'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ClipboardList, 
  Clock, 
  AlertCircle, 
  Eye, 
  ShoppingBag, 
  ChevronRight,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
  Package,
  RefreshCw,
  Search,
  ChevronDown,
  Filter,
  ArrowUpDown,
  Calendar,
  MessageSquare,
  TrendingUp,
  PanelLeft,
  CreditCard,
  Briefcase,
  SearchX
} from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { formatCurrency } from '@/lib/utils';
import { getUserOrders } from '@/lib/firebase/services';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';

interface Order {
  id: string;
  serviceId: string;
  serviceName: string;
  clientId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  totalAmount: number;
  createdAt: any;
  updatedAt: any;
  serviceImage?: string;
  amount: number;
  currency: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
}

// Component to display order cards
const OrderCard = ({ order, onClick }: { order: Order, onClick: () => void }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-purple-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  const getBackgroundColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-100';
      case 'cancelled':
        return 'bg-red-50 border-red-100';
      default:
        return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`border rounded-lg overflow-hidden hover:shadow-md transition-all cursor-pointer ${getBackgroundColor(order.status)}`}
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="bg-primary/10 p-2 rounded-lg mr-4">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium line-clamp-1">{order.serviceName}</h3>
              <div className="text-xs text-muted-foreground flex items-center mt-1">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(order.createdAt as string)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-sm mb-3">
          <div>
            <div className="text-muted-foreground text-xs">Order ID</div>
            <div className="font-mono text-xs truncate">{order.id.substring(0, 8)}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Amount</div>
            <div>{formatCurrency(order.amount, order.currency)}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Payment</div>
            <div className="flex items-center">
              {order.paymentStatus === 'completed' ? (
                <span className="text-green-600 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Paid
                </span>
              ) : (
                <span className="text-yellow-600 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {order.paymentStatus}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="flex items-center gap-1 capitalize">
            {getStatusIcon(order.status)}
            {order.status}
          </Badge>
          
          <Button variant="ghost" size="sm" className="gap-1 h-8 text-xs">
            View Details
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default function OrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<{ field: string; direction: 'asc' | 'desc' }>({
    field: 'createdAt',
    direction: 'desc'
  });

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        return; // Wait for auth to initialize
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const userOrders = await getUserOrders(user.uid);
        setOrders(userOrders);
        setFilteredOrders(userOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
        toast.error(error instanceof Error ? error.message : 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchOrders();
    }
  }, [user]);

  useEffect(() => {
    if (!orders.length) return;
    
    let result = [...orders];
    
    // Apply status filter
    if (statusFilter) {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(order => 
        order.serviceName.toLowerCase().includes(term) ||
        order.id.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let valueA = a[sortBy.field];
      let valueB = b[sortBy.field];
      
      // Handle dates
      if (sortBy.field === 'createdAt' || sortBy.field === 'updatedAt') {
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
      }
      
      if (sortBy.direction === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    setFilteredOrders(result);
  }, [orders, searchTerm, statusFilter, sortBy]);

  // Improved UI for the Orders page
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center">
              <ClipboardList className="h-8 w-8 mr-3 text-primary" />
              My Orders
            </h1>
            <p className="text-muted-foreground">
              Track and manage your service orders
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex gap-2">
            <Link href="/client/services">
              <Button variant="outline" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Browse Services</span>
                <span className="sm:hidden">Services</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter and search controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search by service name or order ID..."
                className="pl-9 pr-4"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
            <div className="flex gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                    <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className={!statusFilter ? "bg-accent" : ""}
                    onClick={() => setStatusFilter(null)}
                  >
                    All orders
                </DropdownMenuItem>
                  <DropdownMenuItem
                    className={statusFilter === 'pending' ? "bg-accent" : ""}
                    onClick={() => setStatusFilter('pending')}
                  >
                    <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                  Pending
                </DropdownMenuItem>
                  <DropdownMenuItem
                    className={statusFilter === 'confirmed' ? "bg-accent" : ""}
                    onClick={() => setStatusFilter('confirmed')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2 text-blue-500" />
                  Confirmed
                </DropdownMenuItem>
                  <DropdownMenuItem
                    className={statusFilter === 'processing' ? "bg-accent" : ""}
                    onClick={() => setStatusFilter('processing')}
                  >
                    <RefreshCw className="h-4 w-4 mr-2 text-purple-500" />
                  Processing
                </DropdownMenuItem>
                  <DropdownMenuItem
                    className={statusFilter === 'completed' ? "bg-accent" : ""}
                    onClick={() => setStatusFilter('completed')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Completed
                </DropdownMenuItem>
                  <DropdownMenuItem
                    className={statusFilter === 'cancelled' ? "bg-accent" : ""}
                    onClick={() => setStatusFilter('cancelled')}
                  >
                    <XCircle className="h-4 w-4 mr-2 text-red-500" />
                  Cancelled
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                  Sort
                    <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className={sortBy.field === 'createdAt' && sortBy.direction === 'desc' ? "bg-accent" : ""}
                    onClick={() => setSortBy({ field: 'createdAt', direction: 'desc' })}
                  >
                    Newest first
                </DropdownMenuItem>
                  <DropdownMenuItem
                    className={sortBy.field === 'createdAt' && sortBy.direction === 'asc' ? "bg-accent" : ""}
                    onClick={() => setSortBy({ field: 'createdAt', direction: 'asc' })}
                  >
                    Oldest first
                </DropdownMenuItem>
                  <DropdownMenuItem
                    className={sortBy.field === 'amount' && sortBy.direction === 'desc' ? "bg-accent" : ""}
                    onClick={() => setSortBy({ field: 'amount', direction: 'desc' })}
                  >
                    Amount (high to low)
                </DropdownMenuItem>
                  <DropdownMenuItem
                    className={sortBy.field === 'amount' && sortBy.direction === 'asc' ? "bg-accent" : ""}
                    onClick={() => setSortBy({ field: 'amount', direction: 'asc' })}
                  >
                    Amount (low to high)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
          {/* Active filters */}
          {(statusFilter || searchTerm) && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Active filters:</span>
              {statusFilter && (
                <Badge variant="secondary" className="flex items-center gap-1 capitalize">
                  Status: {statusFilter}
                  <XCircle 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setStatusFilter(null)}
                  />
                </Badge>
              )}
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchTerm}
                  <XCircle 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setSearchTerm('')}
                  />
                </Badge>
              )}
                        </div>
          )}
                      </div>
                      
        {/* Order statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Card className="bg-blue-50 border-blue-100">
            <CardContent className="flex items-center p-4">
              <div className="bg-blue-500 p-2 rounded-full mr-3">
                <ClipboardList className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-blue-700">Total Orders</p>
                <p className="text-xl font-bold text-blue-800">{orders.length}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-100">
            <CardContent className="flex items-center p-4">
              <div className="bg-green-500 p-2 rounded-full mr-3">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
                      <div>
                <p className="text-xs text-green-700">Completed</p>
                <p className="text-xl font-bold text-green-800">
                  {orders.filter(o => o.status === 'completed').length}
                </p>
                        </div>
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-50 border-yellow-100">
            <CardContent className="flex items-center p-4">
              <div className="bg-yellow-500 p-2 rounded-full mr-3">
                <Clock className="h-5 w-5 text-white" />
        </div>
              <div>
                <p className="text-xs text-yellow-700">In Progress</p>
                <p className="text-xl font-bold text-yellow-800">
                  {orders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.status)).length}
                </p>
      </div>
            </CardContent>
          </Card>
          
          <Card className="bg-red-50 border-red-100">
            <CardContent className="flex items-center p-4">
              <div className="bg-red-500 p-2 rounded-full mr-3">
                <XCircle className="h-5 w-5 text-white" />
                    </div>
              <div>
                <p className="text-xs text-red-700">Cancelled</p>
                <p className="text-xl font-bold text-red-800">
                  {orders.filter(o => o.status === 'cancelled').length}
                </p>
                  </div>
            </CardContent>
              </Card>
        </div>

        {/* Orders list */}
        {filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onClick={() => router.push(`/client/orders/${order.id}`)} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-12 border rounded-lg bg-muted/20">
            {!statusFilter && !searchTerm && orders.length === 0 ? (
              <div className="max-w-md mx-auto">
                <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">
                  You haven't placed any orders yet. Browse our services to get started.
            </p>
            <Button asChild>
              <Link href="/client/services">Browse Services</Link>
            </Button>
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <SearchX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No matching orders</h3>
                <p className="text-muted-foreground mb-6">
                  No orders match your current filters. Try adjusting your search criteria.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter(null);
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
} 