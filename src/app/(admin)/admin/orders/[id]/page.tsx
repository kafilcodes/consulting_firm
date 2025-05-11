'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { getOrder, getOrderMessages, updateOrderStatus, sendOrderMessage } from '@/lib/firebase/services';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ArrowLeft, FileText, MessageSquare, CheckCircle2, Clock, Calendar, AlertCircle, Banknote, User, Info, Send } from 'lucide-react';

export default function OrderDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, userRole, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  useEffect(() => {
    if (!authLoading && (!user || userRole !== 'admin')) {
      router.push('/auth/signin');
      return;
    }

    const fetchOrderData = async () => {
      if (!params.id) return;
      
      try {
        setIsLoading(true);
        const orderData = await getOrder(params.id);
        
        if (!orderData) {
          toast.error('Order not found');
          router.push('/admin/orders');
          return;
        }
        
        setOrder(orderData);
        setNewStatus(orderData.status);
        
        // Also fetch messages
        const messagesData = await getOrderMessages(params.id);
        setMessages(messagesData);
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && userRole === 'admin') {
      fetchOrderData();
    }
  }, [params.id, user, userRole, authLoading, router]);

  const handleUpdateStatus = async () => {
    try {
      await updateOrderStatus(
        order.id,
        newStatus,
        statusNote,
        user?.uid || 'admin'
      );
      
      // Update local state
      setOrder(prev => ({
        ...prev,
        status: newStatus,
        timeline: [
          ...prev.timeline,
          {
            status: newStatus,
            message: statusNote || `Status updated to ${newStatus}`,
            timestamp: new Date().toISOString(),
            updatedBy: user?.uid || 'admin'
          }
        ]
      }));
      
      toast.success(`Order status updated to ${newStatus}`);
      setIsUpdateStatusDialogOpen(false);
      setStatusNote('');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      setIsSendingMessage(true);
      
      await sendOrderMessage(
        order.id,
        {
          text: newMessage,
          senderId: user?.uid || 'admin',
          senderName: user?.displayName || 'Admin',
          senderRole: 'admin',
          timestamp: new Date().toISOString()
        }
      );
      
      // Add message to local state
      const newMessageObj = {
        id: Date.now().toString(),
        text: newMessage,
        senderId: user?.uid || 'admin',
        senderName: user?.displayName || 'Admin',
        senderRole: 'admin',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, newMessageObj]);
      setNewMessage('');
      toast.success('Message sent');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'confirmed':
        return <Badge className="bg-blue-100 text-blue-800">Confirmed</Badge>;
      case 'processing':
        return <Badge className="bg-purple-100 text-purple-800">Processing</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 col-span-2" />
          <Skeleton className="h-64" />
        </div>
        
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
        <p className="text-muted-foreground mb-6">The order you're looking for doesn't exist or has been deleted.</p>
        <Button onClick={() => router.push('/admin/orders')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <h1 className="text-2xl font-bold">
            Order #{order.orderNumber || order.id.substring(0, 6)}
          </h1>
          {getStatusBadge(order.status)}
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => setIsUpdateStatusDialogOpen(true)}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Update Status
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="details">
            <Info className="h-4 w-4 mr-2" />
            Details
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <Clock className="h-4 w-4 mr-2" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="messages">
            <MessageSquare className="h-4 w-4 mr-2" />
            Messages
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Service Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{order.serviceName}</h3>
                    <p className="text-muted-foreground">{order.serviceDescription}</p>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <Badge variant="outline" className="text-lg font-semibold">
                      ₹{order.amount?.toLocaleString() || 0}
                    </Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Order Date</h4>
                    <p>{order.createdAt ? formatDate(order.createdAt) : 'Not available'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Last Updated</h4>
                    <p>{order.updatedAt ? formatDate(order.updatedAt) : 'Not available'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Payment Status</h4>
                    <Badge variant={order.paymentStatus === 'paid' ? 'success' : 'secondary'}>
                      {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Payment Method</h4>
                    <p>{order.paymentMethod || 'Not specified'}</p>
                  </div>
                </div>
                
                {order.requirements && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Requirements</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {typeof order.requirements === 'string' ? (
                          <li>{order.requirements}</li>
                        ) : Array.isArray(order.requirements) ? (
                          order.requirements.map((req: string, i: number) => (
                            <li key={i}>{req}</li>
                          ))
                        ) : null}
                      </ul>
                    </div>
                  </>
                )}
                
                {order.notes && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Additional Notes</h4>
                      <p className="text-muted-foreground">{order.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={order.userPhotoURL} />
                    <AvatarFallback>{order.userName?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{order.userName || 'Unknown User'}</h3>
                    <p className="text-sm text-muted-foreground">{order.userEmail || 'No email provided'}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  {order.userPhone && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Phone</h4>
                      <p>{order.userPhone}</p>
                    </div>
                  )}
                  
                  {order.address && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Address</h4>
                      <p>{order.address}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Customer Since</h4>
                    <p>{order.userCreatedAt ? formatDate(order.userCreatedAt) : 'Unknown'}</p>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push(`/admin/users/${order.userId}`)}
                >
                  <User className="h-4 w-4 mr-2" />
                  View Customer Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
              <CardDescription>Track the progress of this order over time</CardDescription>
            </CardHeader>
            <CardContent>
              {order.timeline && order.timeline.length > 0 ? (
                <div className="relative border-l border-gray-200 pl-4 ml-2 space-y-6">
                  {order.timeline.map((event: any, index: number) => (
                    <div key={index} className="relative pb-6">
                      <div className="absolute -left-[21px] mt-1.5 h-4 w-4 rounded-full border border-white bg-gray-200">
                        {event.status === 'completed' && <div className="absolute inset-0 rounded-full bg-green-500" />}
                        {event.status === 'cancelled' && <div className="absolute inset-0 rounded-full bg-red-500" />}
                        {event.status === 'processing' && <div className="absolute inset-0 rounded-full bg-blue-500" />}
                        {event.status === 'confirmed' && <div className="absolute inset-0 rounded-full bg-emerald-500" />}
                        {event.status === 'pending' && <div className="absolute inset-0 rounded-full bg-yellow-500" />}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <div>
                          <h3 className="font-medium">
                            Status changed to {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </h3>
                          {event.message && <p className="text-muted-foreground mt-1">{event.message}</p>}
                        </div>
                        <time className="text-sm text-muted-foreground mt-1 sm:mt-0">
                          {event.timestamp ? formatDate(event.timestamp) : 'Unknown date'}
                        </time>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-1">No timeline events</h3>
                  <p className="text-muted-foreground text-center">
                    This order doesn't have any recorded status changes yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <CardDescription>Communication between you and the customer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-[400px] overflow-y-auto border rounded-md p-4">
                {messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isAdmin = message.senderRole === 'admin';
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              isAdmin
                                ? 'bg-blue-100 text-blue-900'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium">
                                {message.senderName || (isAdmin ? 'Admin' : 'Customer')}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {message.timestamp
                                  ? format(new Date(message.timestamp), 'PPp')
                                  : ''}
                              </span>
                            </div>
                            <p>{message.text}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-1">No messages yet</h3>
                    <p className="text-muted-foreground text-center">
                      Start the conversation with your customer.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex items-end gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-1 min-h-[80px]"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!newMessage.trim() || isSendingMessage}
                >
                  {isSendingMessage ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Update Status Dialog */}
      <Dialog open={isUpdateStatusDialogOpen} onOpenChange={setIsUpdateStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status of this order and add an optional note.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                New Status
              </label>
              <Select
                value={newStatus}
                onValueChange={setNewStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
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
              <label htmlFor="note" className="text-sm font-medium">
                Note (Optional)
              </label>
              <Textarea
                id="note"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Add a note about this status change..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 