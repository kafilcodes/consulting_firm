'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { getUserById, getOrdersByUserId } from '@/lib/firebase/services';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  AtSign,
  Building,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  FileText,
  Info,
  Mail,
  MapPin,
  MessageSquare,
  PackageOpen,
  Phone,
  ShoppingCart,
  User,
  Wallet,
  XCircle,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface UserData {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;
  createdAt?: string;
  lastLogin?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  companyName?: string;
  notes?: string;
}

interface Order {
  id: string;
  userId: string;
  userName: string;
  serviceId: string;
  serviceName: string;
  status: string;
  amount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  paymentStatus: string;
}

export default function ClientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [clientInfo, setClientInfo] = useState<UserData | null>(null);
  const [clientOrders, setClientOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [orderMetrics, setOrderMetrics] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
    totalSpent: 0
  });

  const clientId = params.id as string;

  useEffect(() => {
    const fetchClientData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Fetch client information
        const userData = await getUserById(clientId);
        if (!userData) {
          toast.error('Client not found');
          router.push('/employee/clients');
          return;
        }
        
        setClientInfo(userData);
        
        // Fetch client orders
        const orders = await getOrdersByUserId(clientId);
        setClientOrders(orders);
        
        // Calculate order metrics
        const metrics = {
          total: orders.length,
          completed: orders.filter(order => order.status === 'completed').length,
          pending: orders.filter(order => ['pending', 'confirmed', 'processing'].includes(order.status)).length,
          cancelled: orders.filter(order => order.status === 'cancelled').length,
          totalSpent: orders
            .filter(order => order.paymentStatus === 'completed')
            .reduce((total, order) => total + order.amount, 0)
        };
        
        setOrderMetrics(metrics);
      } catch (error) {
        console.error('Error fetching client data:', error);
        toast.error('Failed to load client information');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClientData();
  }, [user, clientId, router]);

  function getInitials(name: string) {
    if (!name) return 'UN';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  function getRandomColor(userId: string) {
    const colors = [
      'bg-red-500',
      'bg-green-500',
      'bg-blue-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500'
    ];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  }

  function getStatusBadge(status: string) {
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
  }

  function getPaymentStatusBadge(status: string) {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Paid</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Skeleton className="h-40 w-full rounded-lg" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px] md:col-span-2" />
        </div>
      </div>
    );
  }

  if (!clientInfo) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <User className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Client Not Found</h2>
        <p className="text-muted-foreground mb-6">The client you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push('/employee/clients')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Clients
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Button 
            variant="ghost" 
            className="mb-2 -ml-4 hover:bg-transparent p-2"
            onClick={() => router.push('/employee/clients')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            Client Profile
          </h1>
          <p className="text-muted-foreground">
            View and manage client information
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/employee/chat?clientId=${clientInfo.uid}`)}
            className="gap-1"
          >
            <MessageSquare className="h-4 w-4" />
            Send Message
          </Button>
        </div>
      </div>
      
      {/* Client Profile Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <Avatar className="h-20 w-20">
              <AvatarImage src={clientInfo.photoURL || ''} alt={clientInfo.displayName} />
              <AvatarFallback className={`text-xl ${getRandomColor(clientInfo.uid)}`}>
                {getInitials(clientInfo.displayName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-1">
              <h2 className="text-2xl font-bold">{clientInfo.displayName}</h2>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {clientInfo.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {clientInfo.email}
                  </div>
                )}
                {clientInfo.phoneNumber && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {clientInfo.phoneNumber}
                  </div>
                )}
                {clientInfo.createdAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Member since {formatDate(clientInfo.createdAt)}
                  </div>
                )}
              </div>
              {clientInfo.companyName && (
                <div className="flex items-center gap-1 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{clientInfo.companyName}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:items-end gap-2">
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {orderMetrics.total} Orders
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Active Client
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                ID: {clientInfo.uid.slice(0, 12)}...
              </p>
              {clientInfo.lastLogin && (
                <p className="text-sm text-muted-foreground">
                  Last login: {formatDate(clientInfo.lastLogin)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Order metrics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{orderMetrics.total}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{orderMetrics.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500/30" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Orders</p>
                <p className="text-2xl font-bold">{orderMetrics.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500/30" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">{formatCurrency(orderMetrics.totalSpent, 'INR')}</p>
              </div>
              <Wallet className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <Info className="h-4 w-4" />
            <span className="md:block hidden">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-1">
            <PackageOpen className="h-4 w-4" />
            <span className="md:block hidden">Order History</span>
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span className="md:block hidden">Notes</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Client Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 grid-cols-1 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium">Contact Information</h3>
                <div className="mt-3 space-y-3">
                  <div className="flex gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{clientInfo.email || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Phone Number</p>
                      <p className="text-sm text-muted-foreground">{clientInfo.phoneNumber || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  {clientInfo.companyName && (
                    <div className="flex gap-2">
                      <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Company</p>
                        <p className="text-sm text-muted-foreground">{clientInfo.companyName}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Address</h3>
                <div className="mt-3 space-y-3">
                  {(clientInfo.address || clientInfo.city || clientInfo.state || clientInfo.zipCode || clientInfo.country) ? (
                    <div className="flex gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        {clientInfo.address && <p className="text-sm">{clientInfo.address}</p>}
                        {(clientInfo.city || clientInfo.state || clientInfo.zipCode) && (
                          <p className="text-sm">
                            {[
                              clientInfo.city,
                              clientInfo.state,
                              clientInfo.zipCode
                            ].filter(Boolean).join(', ')}
                          </p>
                        )}
                        {clientInfo.country && <p className="text-sm">{clientInfo.country}</p>}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No address information provided</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Account Information</h3>
                <div className="mt-3 space-y-3">
                  <div className="flex gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Account Created</p>
                      <p className="text-sm text-muted-foreground">
                        {clientInfo.createdAt ? formatDate(clientInfo.createdAt) : 'Not available'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <AtSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">User ID</p>
                      <p className="text-sm text-muted-foreground">{clientInfo.uid}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Activity</h3>
                <div className="mt-3 space-y-3">
                  <div className="flex gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Last Login</p>
                      <p className="text-sm text-muted-foreground">
                        {clientInfo.lastLogin ? formatDate(clientInfo.lastLogin, true) : 'Not available'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <ShoppingCart className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Order Activity</p>
                      <p className="text-sm text-muted-foreground">
                        {clientOrders.length > 0 
                          ? `Last order on ${formatDate(clientOrders[0].createdAt)}`
                          : 'No orders yet'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order History</CardTitle>
              <CardDescription>
                Complete history of client orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              {clientOrders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                        <TableCell>{order.serviceName}</TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>{formatCurrency(order.amount, order.currency)}</TableCell>
                        <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/employee/orders/${order.id}`)}
                            className="gap-1"
                          >
                            View
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <PackageOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No Orders Yet</h3>
                  <p className="text-muted-foreground mt-2">This client hasn't placed any orders yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Client Notes</CardTitle>
              <CardDescription>
                Internal notes about this client (only visible to employees)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <textarea 
                className="w-full min-h-[200px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Add notes about this client here..."
                defaultValue={clientInfo.notes || ''}
              />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Save Notes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 