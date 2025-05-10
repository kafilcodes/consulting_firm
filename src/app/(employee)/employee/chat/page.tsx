'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { getAllUsers, getUserById, getOrdersByUserId, getOrderChatMessages, addMessageToOrderChat } from '@/lib/firebase/services';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  Clock,
  ClipboardList,
  FileCheck,
  Loader2,
  MessageSquare,
  PaperclipIcon,
  RefreshCw,
  Search,
  Send,
  User,
  Users,
  XCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useVirtualizer } from '@tanstack/react-virtual';

interface UserData {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;
  lastActive?: string;
  hasUnreadMessages?: boolean;
}

interface Order {
  id: string;
  serviceName: string;
  status: string;
  createdAt: string;
}

interface Message {
  id: string;
  text: string;
  sender: string;
  senderName: string;
  senderRole: 'client' | 'employee' | 'system';
  timestamp: string;
  orderId: string;
  isRead: boolean;
}

export default function EmployeeChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [clients, setClients] = useState<UserData[]>([]);
  const [filteredClients, setFilteredClients] = useState<UserData[]>([]);
  const [selectedClient, setSelectedClient] = useState<UserData | null>(null);
  const [clientOrders, setClientOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  const parentRef = React.useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 70,
    overscan: 10,
  });

  // Initialize selected client from URL param if provided
  useEffect(() => {
    const clientId = searchParams.get('clientId');
    const orderId = searchParams.get('orderId');
    
    if (clientId) {
      fetchClientById(clientId);
    }
    
    if (orderId && !clientId) {
      // If only order ID is provided, we need to fetch the client info from the order
      loadOrderConversation(orderId);
    }
  }, [searchParams]);

  // Fetch all clients when component mounts
  useEffect(() => {
    const fetchClients = async () => {
      if (!user) return;
      
      setIsLoadingClients(true);
      try {
        const allUsers = await getAllUsers();
        
        // Add a random property for demo purposes to show unread messages
        const processedUsers = allUsers.map(u => ({
          ...u,
          hasUnreadMessages: Math.random() > 0.7, // 30% chance of having unread messages (for demo)
          lastActive: new Date(Date.now() - Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000)).toISOString() // Random last active date
        }));
        
        setClients(processedUsers);
        setFilteredClients(processedUsers);
      } catch (error) {
        console.error('Error fetching clients:', error);
        toast.error('Failed to load clients');
      } finally {
        setIsLoadingClients(false);
      }
    };
    
    fetchClients();
  }, [user]);

  // Filter clients based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClients(clients);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = clients.filter(client => 
      client.displayName.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term)
    );
    
    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  // Load messages when a client and order are selected
  useEffect(() => {
    if (selectedClient && selectedOrder) {
      loadMessages(selectedOrder.id);
    }
  }, [selectedClient, selectedOrder]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && parentRef.current) {
      scrollToBottom();
    }
  }, [messages]);

  const fetchClientById = async (clientId: string) => {
    try {
      const clientInfo = await getUserById(clientId);
      if (clientInfo) {
        setSelectedClient(clientInfo);
        loadClientOrders(clientId);
      } else {
        toast.error('Client not found');
      }
    } catch (error) {
      console.error('Error fetching client:', error);
      toast.error('Failed to load client information');
    }
  };

  const loadOrderConversation = async (orderId: string) => {
    // This would fetch order info and then set the client and order
    // For now, we'll just show a toast
    toast.info('Loading conversation for order ' + orderId);
  };

  const loadClientOrders = async (clientId: string) => {
    try {
      const orders = await getOrdersByUserId(clientId);
      setClientOrders(orders);
      
      // Select the most recent order by default
      if (orders.length > 0) {
        const mostRecentOrder = orders.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        
        setSelectedOrder(mostRecentOrder);
      } else {
        setSelectedOrder(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching client orders:', error);
      toast.error('Failed to load client orders');
    }
  };

  const loadMessages = async (orderId: string) => {
    setIsLoadingMessages(true);
    try {
      const chatMessages = await getOrderChatMessages(orderId);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedOrder || !user || isSendingMessage) return;
    
    setIsSendingMessage(true);
    try {
      await addMessageToOrderChat(
        selectedOrder.id,
        newMessage,
        user.uid,
        user.displayName || user.email || 'Employee',
        'employee'
      );
      
      setNewMessage('');
      
      // Fetch the latest messages
      await loadMessages(selectedOrder.id);
      
      // Scroll to bottom
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const scrollToBottom = () => {
    if (parentRef.current) {
      const scrollElement = parentRef.current;
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'UN';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getRandomColor = (userId: string) => {
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
  };

  const formatMessageTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
        ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  // Loading state for clients
  if (isLoadingClients && clients.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between mb-4">
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-10 w-1/4" />
        </div>
        
        <div className="flex gap-4 mb-4">
          <Skeleton className="h-10 flex-1" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
          <Skeleton className="h-full" />
          <Skeleton className="h-full md:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Client Messages
          </h1>
          <p className="text-muted-foreground">
            Communicate with clients about their orders
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/employee/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Client List */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="border rounded-lg overflow-hidden md:col-span-1 flex flex-col"
        >
          <div className="border-b p-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                className="pl-9 pr-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="divide-y">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <div 
                    key={client.uid}
                    className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedClient?.uid === client.uid ? 'bg-muted' : ''
                    }`}
                    onClick={() => {
                      setSelectedClient(client);
                      loadClientOrders(client.uid);
                    }}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={client.photoURL || ''} alt={client.displayName} />
                        <AvatarFallback className={getRandomColor(client.uid)}>
                          {getInitials(client.displayName)}
                        </AvatarFallback>
                      </Avatar>
                      {client.hasUnreadMessages && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-medium truncate">{client.displayName}</p>
                        <span className="text-xs text-muted-foreground">
                          {client.lastActive && formatDate(client.lastActive, false, true)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{client.email}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No clients found</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {searchTerm ? 'Try a different search term' : 'No clients available'}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </motion.div>
        
        {/* Chat Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="border rounded-lg overflow-hidden md:col-span-2 flex flex-col"
        >
          {selectedClient ? (
            <>
              {/* Chat Header */}
              <div className="border-b p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedClient.photoURL || ''} alt={selectedClient.displayName} />
                    <AvatarFallback className={getRandomColor(selectedClient.uid)}>
                      {getInitials(selectedClient.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{selectedClient.displayName}</h3>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                        Client
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedClient.email}</p>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <ClipboardList className="h-4 w-4 mr-2" />
                      {selectedOrder ? (
                        <span className="text-sm">Order #{selectedOrder.id.slice(0, 8)}</span>
                      ) : (
                        <span className="text-sm">Select order</span>
                      )}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Select Order</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {clientOrders.length > 0 ? (
                      clientOrders.map((order) => (
                        <DropdownMenuItem 
                          key={order.id}
                          className={selectedOrder?.id === order.id ? "bg-accent" : ""}
                          onClick={() => setSelectedOrder(order)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>#{order.id.slice(0, 8)} - {order.serviceName}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {order.status}
                            </Badge>
                          </div>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem disabled>No orders found</DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {selectedOrder ? (
                <>
                  {/* Messages */}
                  <div 
                    ref={parentRef}
                    className="flex-1 p-4 overflow-y-auto"
                  >
                    {isLoadingMessages ? (
                      <div className="h-full flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <p className="text-sm text-muted-foreground">Loading messages...</p>
                        </div>
                      </div>
                    ) : messages.length > 0 ? (
                      <div
                        style={{
                          height: `${rowVirtualizer.getTotalSize()}px`,
                          width: '100%',
                          position: 'relative',
                        }}
                      >
                        {rowVirtualizer.getVirtualItems().map(virtualRow => {
                          const message = messages[virtualRow.index];
                          const isFromClient = message.senderRole === 'client';
                          const isSystem = message.senderRole === 'system';
                          
                          return (
                            <div
                              key={virtualRow.index}
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                transform: `translateY(${virtualRow.start}px)`,
                              }}
                            >
                              {isSystem ? (
                                <div className="flex justify-center my-4">
                                  <div className="bg-muted px-4 py-2 rounded-full text-sm text-center">
                                    {message.text}
                                  </div>
                                </div>
                              ) : (
                                <div 
                                  className={`flex gap-3 mb-4 ${isFromClient ? '' : 'flex-row-reverse'}`}
                                >
                                  <Avatar className="h-8 w-8 mt-1">
                                    <AvatarFallback className={isFromClient ? getRandomColor(message.sender) : 'bg-primary'}>
                                      {isFromClient ? getInitials(message.senderName) : 'EM'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className={`max-w-[70%] ${isFromClient ? '' : 'text-right'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className={`text-xs text-muted-foreground ${isFromClient ? 'order-last' : 'order-first'}`}>
                                        {formatMessageTimestamp(message.timestamp)}
                                      </p>
                                      <p className="text-sm font-medium">{isFromClient ? message.senderName : 'You'}</p>
                                    </div>
                                    <div 
                                      className={`px-4 py-3 rounded-lg ${
                                        isFromClient ? 'bg-muted text-foreground' : 'bg-primary text-primary-foreground'
                                      }`}
                                    >
                                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                          <h3 className="mt-4 text-lg font-semibold">No messages yet</h3>
                          <p className="text-sm text-muted-foreground mt-2">
                            Start the conversation with {selectedClient.displayName}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                      >
                        <PaperclipIcon className="h-4 w-4" />
                      </Button>
                      <Textarea
                        placeholder={`Message ${selectedClient.displayName}...`}
                        className="min-h-10 resize-none"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button
                        className="shrink-0"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isSendingMessage}
                      >
                        {isSendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center p-6">
                  <div className="text-center max-w-md">
                    <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Select an Order</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Please select an order to view and send messages
                    </p>
                    {clientOrders.length === 0 && (
                      <p className="text-sm text-muted-foreground mt-4">
                        This client doesn't have any orders yet
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center max-w-md">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Select a Client</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Select a client from the list to start a conversation
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 