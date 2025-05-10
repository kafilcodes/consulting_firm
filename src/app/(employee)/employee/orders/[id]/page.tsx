'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { getOrderById, getUserById, updateOrderStatus } from '@/lib/firebase/services';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { formatCurrency, formatDate } from '@/lib/utils';
import { OrderChat } from '@/components/client/order-chat';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  FileText,
  InfoIcon,
  MessageSquare,
  User,
  XCircle,
  RefreshCw,
  Calendar,
  Download,
  Loader2,
  ReceiptText,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  serviceId: string;
  serviceName: string;
  serviceDescription?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  amount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  orderDetails?: Record<string, any>;
  timeline: any[];
}

interface User {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;
  createdAt?: string;
  lastLogin?: string;
  address?: string;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [client, setClient] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updateStatusDialogOpen, setUpdateStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusUpdateMessage, setStatusUpdateMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const orderId = params.id as string;

  useEffect(() => {
    const fetchOrderData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const orderData = await getOrderById(orderId);
        if (!orderData) {
          toast.error('Order not found');
          router.push('/employee/orders');
          return;
        }
        
        setOrder(orderData);
        setNewStatus(orderData.status);
        
        // Fetch client data
        if (orderData.userId) {
          const clientData = await getUserById(orderData.userId);
          setClient(clientData);
        }
      } catch (error) {
        console.error('Error fetching order data:', error);
        toast.error('Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrderData();
  }, [user, orderId, router]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Confirmed</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Processing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1"><XCircle className="h-3 w-3" /> Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
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
  };

  const handleUpdateStatus = async () => {
    if (!order || !newStatus || !statusUpdateMessage.trim()) {
      toast.error('Please provide all required information');
      return;
    }
    
    setIsUpdating(true);
    try {
      await updateOrderStatus(
        order.id,
        newStatus as any,
        statusUpdateMessage,
        user?.displayName || user?.email || 'Employee'
      );
      
      // Update the order in the local state
      setOrder(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          status: newStatus as any,
          updatedAt: new Date().toISOString(),
          timeline: [
            ...(prev.timeline || []),
            {
              status: newStatus,
              message: statusUpdateMessage,
              timestamp: new Date().toISOString(),
              updatedBy: user?.displayName || user?.email || 'Employee'
            }
          ]
        };
      });
      
      setUpdateStatusDialogOpen(false);
      toast.success('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Skeleton className="h-12 w-full" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px] md:col-span-2" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Order Not Found</h2>
        <p className="text-muted-foreground mb-6">The order you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push('/employee/orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
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
            onClick={() => router.push('/employee/orders')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            Order Details
            <span className="ml-2 text-sm align-middle text-muted-foreground">#{order.id.slice(0, 8)}</span>
          </h1>
          <p className="text-muted-foreground">
            {order.serviceName} - {formatDate(order.createdAt)}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setActiveTab('messages')}
            className="gap-1"
          >
            <MessageSquare className="h-4 w-4" />
            Chat with Client
          </Button>
          <Button 
            onClick={() => {
              setUpdateStatusDialogOpen(true);
            }}
          >
            Update Status
          </Button>
        </div>
      </div>
      
      {/* Status info */}
      <Card className="border-l-4" style={{ borderLeftColor: getStatusColor(order.status) }}>
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div className="flex gap-4 items-center">
            <div className="flex flex-col">
              <span className="text-sm font-medium">Order Status</span>
              <div className="mt-1">{getStatusBadge(order.status)}</div>
            </div>
            <Separator orientation="vertical" className="h-10 hidden md:block" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">Last Updated</span>
              <span className="text-sm text-muted-foreground">{formatDate(order.updatedAt, true)}</span>
            </div>
            <Separator orientation="vertical" className="h-10 hidden md:block" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">Payment Status</span>
              <div className="mt-1">{getPaymentStatusBadge(order.paymentStatus)}</div>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Total Amount</span>
            <span className="text-lg font-semibold">{formatCurrency(order.amount, order.currency)}</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <InfoIcon className="h-4 w-4" />
            <span className="md:block hidden">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="client" className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span className="md:block hidden">Client</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span className="md:block hidden">Timeline</span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span className="md:block hidden">Messages</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Service details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Service Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Service</h3>
                  <p className="text-sm">{order.serviceName}</p>
                </div>
                
                {order.serviceDescription && (
                  <div>
                    <h3 className="text-sm font-medium">Description</h3>
                    <p className="text-sm text-muted-foreground">{order.serviceDescription}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium">Amount</h3>
                  <p className="text-sm">{formatCurrency(order.amount, order.currency)}</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Order details and requirements */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Order Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.orderDetails && Object.keys(order.orderDetails).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(order.orderDetails).map(([key, value]) => (
                      <div key={key}>
                        <h3 className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
                        <p className="text-sm text-muted-foreground">
                          {typeof value === 'string' ? value : JSON.stringify(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No detailed requirements provided for this order.</p>
                )}
                
                {order.status === 'completed' && (
                  <div className="pt-4">
                    <Button 
                      variant="outline" 
                      className="w-full mt-2 gap-2"
                      onClick={() => router.push(`/orders/${order.id}/receipt`)}
                    >
                      <ReceiptText className="h-4 w-4" />
                      View Receipt
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="client" className="space-y-6">
          {client ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium">Name</h3>
                    <p className="text-sm">{client.displayName}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium">Email</h3>
                    <p className="text-sm">{client.email}</p>
                  </div>
                  
                  {client.phoneNumber && (
                    <div>
                      <h3 className="text-sm font-medium">Phone</h3>
                      <p className="text-sm">{client.phoneNumber}</p>
                    </div>
                  )}
                  
                  {client.address && (
                    <div>
                      <h3 className="text-sm font-medium">Address</h3>
                      <p className="text-sm">{client.address}</p>
                    </div>
                  )}
                  
                  {client.createdAt && (
                    <div>
                      <h3 className="text-sm font-medium">Member Since</h3>
                      <p className="text-sm">{formatDate(client.createdAt)}</p>
                    </div>
                  )}
                  
                  {client.lastLogin && (
                    <div>
                      <h3 className="text-sm font-medium">Last Login</h3>
                      <p className="text-sm">{formatDate(client.lastLogin)}</p>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div className="flex justify-center pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => router.push(`/employee/clients/${client.uid}`)}
                    className="gap-2"
                  >
                    <User className="h-4 w-4" />
                    View Full Client Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-6 text-center">
                <User className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Client Information Not Available</h3>
                <p className="text-muted-foreground mt-2">The client details for this order could not be loaded.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Order Timeline
              </CardTitle>
              <CardDescription>
                Complete history of this order
              </CardDescription>
            </CardHeader>
            <CardContent>
              {order.timeline && order.timeline.length > 0 ? (
                <ol className="relative border-l border-muted ml-4 space-y-8">
                  {order.timeline.map((event, index) => (
                    <li key={index} className="mb-10 ml-6">
                      <span className="absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-8 ring-background" style={{ backgroundColor: getStatusColor(event.status) }}>
                        {getStatusIcon(event.status)}
                      </span>
                      <div className="ml-2">
                        <h3 className="flex items-center mb-1 text-base font-semibold capitalize">
                          {event.status}
                          {index === order.timeline.length - 1 && (
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded ml-3">
                              Latest
                            </span>
                          )}
                        </h3>
                        <time className="block mb-2 text-xs font-normal leading-none text-muted-foreground">
                          {formatDate(event.timestamp, true)} by {event.updatedBy}
                        </time>
                        <p className="mb-4 text-sm text-muted-foreground">
                          {event.message}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No Timeline Events</h3>
                  <p className="text-muted-foreground mt-2">This order doesn't have any recorded status updates.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="messages" className="space-y-6">
          <Card className="h-[600px] overflow-hidden flex flex-col">
            <CardHeader className="px-6 py-4 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Client Messages
              </CardTitle>
              <CardDescription>
                Communicate with the client about this order
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <OrderChat orderId={order.id} style={{ height: '100%' }} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Update status dialog */}
      <Dialog open={updateStatusDialogOpen} onOpenChange={setUpdateStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Update the status of this order and provide a message for the client.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Order Details</h3>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">{order.serviceName}</span> - {order.userName}
              </p>
              <p className="text-sm text-muted-foreground">
                Current Status: {order.status}
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">New Status</label>
              <Select 
                value={newStatus} 
                onValueChange={setNewStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status Update Message</label>
              <Textarea 
                placeholder="Provide details about this status update..."
                value={statusUpdateMessage}
                onChange={(e) => setStatusUpdateMessage(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This message will be visible to the client
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={isUpdating || !newStatus || !statusUpdateMessage.trim()}
            >
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper functions
function getStatusColor(status: string) {
  switch (status) {
    case 'pending': return '#f59e0b';
    case 'confirmed': return '#3b82f6';
    case 'processing': return '#8b5cf6';
    case 'completed': return '#10b981';
    case 'cancelled': return '#ef4444';
    default: return '#cbd5e1';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'pending': return <Clock className="h-3 w-3 text-white" />;
    case 'confirmed': return <CheckCircle className="h-3 w-3 text-white" />;
    case 'processing': return <RefreshCw className="h-3 w-3 text-white" />;
    case 'completed': return <CheckCircle className="h-3 w-3 text-white" />;
    case 'cancelled': return <XCircle className="h-3 w-3 text-white" />;
    default: return <InfoIcon className="h-3 w-3 text-white" />;
  }
} 