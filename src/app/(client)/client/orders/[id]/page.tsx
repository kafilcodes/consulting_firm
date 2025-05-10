'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import '@/styles/resizable.css';
import { 
  ArrowLeft, 
  Clock, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Upload, 
  Send,
  Download,
  Loader2,
  RefreshCw,
  ClipboardCheck,
  CheckCheck,
  User,
  Package,
  BarChart,
  Calendar,
  Tag,
  CreditCard,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Clock4,
  Receipt,
  MessageSquare,
  HelpCircle,
  ReceiptText,
  FileDown
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from '@/components/ui/scroll-area';

import { formatCurrency } from '@/lib/utils';
import { getOrder, addOrderDocument } from '@/lib/firebase/services';
import { useAuth } from '@/contexts/auth-context';
import { OrderChat } from '@/components/client/order-chat';
import { OrderComplaintForm, OrderComplaintHistory } from '@/components/client/order-complaint';
import { OrderReceipt } from '@/components/client/order-receipt';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-blue-500',
  processing: 'bg-purple-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
  payment_initiated: 'bg-blue-400',
  payment_completed: 'bg-green-400',
  payment_failed: 'bg-red-400',
  document_added: 'bg-blue-300',
  document_rejected: 'bg-red-300',
  message_sent: 'bg-gray-300',
  complaint_submitted: 'bg-orange-400'
};

const statusIcons: Record<string, any> = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: RefreshCw,
  completed: CheckCircle,
  cancelled: XCircle,
  payment_initiated: CreditCard,
  payment_completed: Receipt,
  payment_failed: XCircle,
  document_added: FileText,
  document_rejected: AlertCircle,
  message_sent: MessageSquare,
  complaint_submitted: HelpCircle
};

const statusDescriptions: Record<string, string> = {
  pending: 'Your order is awaiting confirmation',
  confirmed: 'Your order has been confirmed',
  processing: 'Work on your order is in progress',
  completed: 'Your order has been completed',
  cancelled: 'This order has been cancelled'
};

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const orderId = id as string;

  // Prevent auto-scrolling when component re-renders
  useEffect(() => {
    if (pageRef.current) {
      const savedScrollPosition = sessionStorage.getItem(`orderDetails_${orderId}_scrollPos`);
      if (savedScrollPosition) {
        window.scrollTo(0, parseInt(savedScrollPosition));
      }
    }

    // Save scroll position when leaving the page
    const handleScroll = () => {
      sessionStorage.setItem(`orderDetails_${orderId}_scrollPos`, window.scrollY.toString());
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [orderId]);

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!user) {
        return; // Wait for auth to initialize
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const orderData = await getOrder(orderId);
        
        if (!orderData) {
          throw new Error('Order not found');
        }
        
        // Check if the order belongs to the current user
        if (orderData.userId !== user.uid) {
          throw new Error('You do not have permission to view this order');
        }
        
        setOrder(orderData);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
        toast.error(error instanceof Error ? error.message : 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchOrderDetails();
    }
  }, [orderId, user]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      // Auto-fill document name from file name (without extension)
      const fileName = e.target.files[0].name;
      const nameWithoutExtension = fileName.split('.').slice(0, -1).join('.');
      setDocumentName(nameWithoutExtension || fileName);
    }
  };

  // Handle document upload
  const handleUploadDocument = async () => {
    if (!selectedFile || !documentName.trim()) {
      toast.error('Please select a file and provide a document name');
      return;
    }
    
    setUploadingFile(true);
    
    try {
      await addOrderDocument(orderId, selectedFile, documentName);
      toast.success('Document uploaded successfully');
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setDocumentName('');
      
      // Refresh order data
      const updatedOrder = await getOrder(orderId);
      setOrder(updatedOrder);
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload document');
    } finally {
      setUploadingFile(false);
    }
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!message.trim()) {
      return;
    }
    
    try {
      // Update order with new message in timeline
      const updatedOrder = await getOrder(orderId);
      if (updatedOrder) {
        updatedOrder.timeline.push({
          status: 'message_sent',
          message: message,
          timestamp: new Date().toISOString(),
          updatedBy: user?.displayName || user?.email || 'Client'
        });
        
        // TODO: Implement real-time chat with Firebase
        toast.success('Message sent');
        setMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return '';
    }
  };

  // Format exact time
  const formatExactTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'PPpp'); // Example: "Apr 29, 2021, 7:14 PM"
    } catch (e) {
      return dateString;
    }
  };

  // Loading skeleton UI
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex items-center gap-2">
            <Skeleton className="h-10 w-28" />
          </div>
          
          <Skeleton className="h-12 w-64 mb-8" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
            
            <div className="lg:col-span-1">
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{error || 'Order not found'}</AlertTitle>
          <AlertDescription>
            {error === 'Order not found' 
              ? "We couldn't find the order you're looking for. It may have been removed or the URL may be incorrect."
              : error === 'You do not have permission to view this order'
                ? "You don't have permission to view this order. Please check if you're logged in with the correct account."
                : "An error occurred while loading the order. Please try again later."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Get status badge based on order status
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
    <div className="container mx-auto px-4 py-8" ref={pageRef}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Back button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-6 hover:bg-background"
          asChild
        >
          <Link href="/client/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
        
        {/* Order Header - Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-1 border-2 border-primary/10 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusBadge(order.status)}
                    <span className="text-sm text-muted-foreground">
                      • Order #{orderId.substring(0, 8)}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
                    {order.serviceName}
                  </h1>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    {formatExactTime(order.createdAt)}
                  </p>
                </div>
                
                <div className="flex flex-col items-end space-y-1">
                  <div className="text-xl font-bold">
                    {formatCurrency(order.amount, order.currency)}
                  </div>
                  <Badge variant={order.paymentStatus === 'completed' ? 'default' : 'secondary'} className="h-7">
                    Payment: {order.paymentStatus === 'completed' ? 'Paid' : order.paymentStatus}
                  </Badge>
                </div>
              </div>
              
              {order.status !== 'cancelled' && (
                <div className="mt-6 bg-muted/40 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${statusColors[order.status] || 'bg-gray-300'}`}></div>
                    <h3 className="font-medium">Status: <span className="capitalize">{order.status}</span></h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {statusDescriptions[order.status] || 'Your order is being processed'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order information */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card className="overflow-hidden shadow-sm border-primary/5">
                <CardHeader className="bg-muted/30 p-5 pb-4">
                  <CardTitle className="text-lg flex items-center">
                    <ReceiptText className="h-5 w-5 mr-2 text-primary" />
                    Order Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-4"
                    >
                      <div>
                        <div className="text-sm font-medium mb-1 text-muted-foreground">Order ID</div>
                        <div className="font-mono text-sm bg-muted/20 p-2 rounded-md overflow-x-auto">
                          {order.id}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium mb-1 text-muted-foreground">Ordered On</div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium mb-1 text-muted-foreground">Service Type</div>
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{order.serviceType || 'Standard'}</span>
                        </div>
                      </div>
                      
                      {order.billingCycle && (
                        <div>
                          <div className="text-sm font-medium mb-1 text-muted-foreground">Billing Cycle</div>
                          <div className="flex items-center">
                            <Clock4 className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="capitalize">{order.billingCycle}</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-4"
                    >
                      <div>
                        <div className="text-sm font-medium mb-1 text-muted-foreground">Amount</div>
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="font-semibold text-lg">{formatCurrency(order.amount, order.currency)}</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium mb-1 text-muted-foreground">Payment Status</div>
                        <Badge variant={order.paymentStatus === 'completed' ? 'outline' : 'secondary'} className="capitalize">
                          {order.paymentStatus === 'completed' ? (
                            <span className="flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                              Paid
                            </span>
                          ) : (
                            order.paymentStatus
                          )}
                        </Badge>
                      </div>
                      
                      {order.razorpayPaymentId && (
                        <div>
                          <div className="text-sm font-medium mb-1 text-muted-foreground">Transaction ID</div>
                          <div className="font-mono text-sm bg-muted/20 p-2 rounded-md overflow-x-auto">
                            {order.razorpayPaymentId}
                          </div>
                        </div>
                      )}

                      {order.razorpayOrderId && (
                        <div>
                          <div className="text-sm font-medium mb-1 text-muted-foreground">Razorpay Order ID</div>
                          <div className="font-mono text-sm bg-muted/20 p-2 rounded-md overflow-x-auto">
                            {order.razorpayOrderId}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Order Receipt */}
            {order.paymentStatus === 'completed' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
              >
                <OrderReceipt order={order} />
              </motion.div>
            )}
            
            {/* Order Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card className="overflow-hidden shadow-sm border-primary/5">
                <CardHeader className="bg-muted/30 p-5 pb-4">
                  <CardTitle className="text-lg flex items-center">
                    <BarChart className="h-5 w-5 mr-2 text-primary" />
                    Order Timeline
                  </CardTitle>
                  <CardDescription>Track the progress of your order</CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-5">
                  <div className="space-y-4">
                    {order.timeline && order.timeline.map((event, index) => (
                      <motion.div 
                        key={index} 
                        className="relative pl-6 pb-4 border-l border-muted last:pb-0"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div 
                          className={`absolute left-[-8px] top-0 w-4 h-4 rounded-full flex items-center justify-center ${
                            statusColors[event.status] || 'bg-gray-300'
                          }`}
                        >
                          {statusIcons[event.status] && React.createElement(statusIcons[event.status], { className: "text-white h-2.5 w-2.5" })}
                        </div>
                        <div>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                            <h4 className="text-sm font-medium capitalize">
                              {event.status.replace(/_/g, ' ')}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(event.timestamp)}
                            </p>
                          </div>
                          {event.message && (
                            <p className="text-sm mt-1">
                              {event.message}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Documents section - show only if documents are available */}
            {order.documents && order.documents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.documents.map((doc, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * i }}
                      >
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 mr-3 text-primary" />
                            <div>
                              <div className="font-medium">{doc.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(doc.uploadedAt)}
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Complaint history if available */}
            <OrderComplaintHistory orderId={orderId} />
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Chat section with resize handle */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="h-auto"
            >
              <ResizableBox
                width={Infinity}
                height={600}
                minConstraints={[Infinity, 400]}
                maxConstraints={[Infinity, 800]}
                resizeHandles={['s']}
                handle={(h, ref) => (
                  <div 
                    className={`resize-handle resize-handle-${h} flex items-center justify-center h-5 cursor-ns-resize border-t border-b bg-muted/50 hover:bg-muted/80 transition-colors w-full`}
                    ref={ref}
                  >
                    <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
                  </div>
                )}
              >
                <div className="h-full overflow-hidden">
                  <OrderChat 
                    orderId={orderId} 
                    orderStatus={order.status} 
                    employeeName={order.employeeName}
                  />
                </div>
              </ResizableBox>
            </motion.div>
            
            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <OrderComplaintForm orderId={orderId} serviceName={order.serviceName} />
              
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2"
                asChild
              >
                <Link href={`/client/services/${order.serviceId}`}>
                  <Package className="h-4 w-4" />
                  View Service Details
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 