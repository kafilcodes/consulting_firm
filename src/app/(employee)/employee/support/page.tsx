'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import {
  AlertCircle,
  ArrowUpDown,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Eye,
  Filter,
  LifeBuoy,
  Loader2,
  MessageSquare,
  Search,
  Star,
  UserCheck,
  UserX,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// For demo purposes, let's create mock data
const MOCK_TICKETS = [
  {
    id: 'TIC-1001',
    subject: 'Payment issue with order #ORD12345',
    description: 'I was charged twice for my order. Please help resolve this issue.',
    userId: 'user1',
    userName: 'John Smith',
    userEmail: 'john.smith@example.com',
    status: 'open',
    priority: 'high',
    category: 'billing',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    assignedTo: null,
    messages: [
      {
        id: 'msg1',
        text: 'I was charged twice for my order. Please help resolve this issue.',
        sender: 'user1',
        senderName: 'John Smith',
        senderRole: 'client',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      }
    ]
  },
  {
    id: 'TIC-1002',
    subject: 'Service delivery delay',
    description: 'My order was supposed to be delivered yesterday, but I haven\'t received it yet.',
    userId: 'user2',
    userName: 'Emily Johnson',
    userEmail: 'emily.j@example.com',
    status: 'in_progress',
    priority: 'medium',
    category: 'delivery',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: 'emp123',
    messages: [
      {
        id: 'msg2',
        text: 'My order was supposed to be delivered yesterday, but I haven\'t received it yet.',
        sender: 'user2',
        senderName: 'Emily Johnson',
        senderRole: 'client',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'msg3',
        text: 'I apologize for the delay. I\'ve checked your order status and it\'s currently in transit. It should be delivered by the end of today.',
        sender: 'emp123',
        senderName: 'Support Agent',
        senderRole: 'employee',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ]
  },
  {
    id: 'TIC-1003',
    subject: 'Refund request for order #ORD54321',
    description: 'I would like to request a refund for my order as the service did not meet my expectations.',
    userId: 'user3',
    userName: 'Michael Davis',
    userEmail: 'm.davis@example.com',
    status: 'open',
    priority: 'low',
    category: 'refund',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: null,
    messages: [
      {
        id: 'msg4',
        text: 'I would like to request a refund for my order as the service did not meet my expectations.',
        sender: 'user3',
        senderName: 'Michael Davis',
        senderRole: 'client',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ]
  },
  {
    id: 'TIC-1004',
    subject: 'Question about additional services',
    description: 'I wanted to know if there are any additional services you offer that would complement my current order.',
    userId: 'user4',
    userName: 'Sarah Wilson',
    userEmail: 'sarah.w@example.com',
    status: 'closed',
    priority: 'medium',
    category: 'inquiry',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: 'emp456',
    messages: [
      {
        id: 'msg5',
        text: 'I wanted to know if there are any additional services you offer that would complement my current order.',
        sender: 'user4',
        senderName: 'Sarah Wilson',
        senderRole: 'client',
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'msg6',
        text: 'Thank you for your inquiry! We do offer complementary services like X, Y, and Z that would go well with your current order. Would you like to know more about any of these?',
        sender: 'emp456',
        senderName: 'Support Manager',
        senderRole: 'employee',
        timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'msg7',
        text: 'Thanks for the information. I\'ve decided to stick with my current order for now, but I appreciate the help!',
        sender: 'user4',
        senderName: 'Sarah Wilson',
        senderRole: 'client',
        timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ]
  },
];

interface Ticket {
  id: string;
  subject: string;
  description: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: 'open' | 'in_progress' | 'closed';
  priority: 'high' | 'medium' | 'low';
  category: string;
  createdAt: string;
  updatedAt: string;
  assignedTo: string | null;
  messages: Message[];
}

interface Message {
  id: string;
  text: string;
  sender: string;
  senderName: string;
  senderRole: 'client' | 'employee' | 'system';
  timestamp: string;
}

export default function EmployeeSupportPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [newStatus, setNewStatus] = useState<string>('');
  const [newPriority, setNewPriority] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState('all');

  // Initial data load
  useEffect(() => {
    // In a real app, you would fetch tickets from a database
    // Here we'll use mock data
    setIsLoading(true);
    setTimeout(() => {
      setTickets(MOCK_TICKETS);
      setFilteredTickets(MOCK_TICKETS);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter tickets based on search and status
  useEffect(() => {
    if (!tickets.length) return;
    
    let result = [...tickets];
    
    // Apply tab filter
    if (selectedTab !== 'all') {
      switch (selectedTab) {
        case 'open':
          result = result.filter(ticket => ticket.status === 'open');
          break;
        case 'in_progress':
          result = result.filter(ticket => ticket.status === 'in_progress');
          break;
        case 'closed':
          result = result.filter(ticket => ticket.status === 'closed');
          break;
      }
    }
    
    // Apply status filter (from dropdown)
    if (statusFilter) {
      result = result.filter(ticket => ticket.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(ticket => 
        ticket.subject.toLowerCase().includes(term) ||
        ticket.userName.toLowerCase().includes(term) ||
        ticket.id.toLowerCase().includes(term)
      );
    }
    
    setFilteredTickets(result);
  }, [tickets, searchTerm, statusFilter, selectedTab]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1"><Clock className="h-3 w-3" /> Open</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1"><UserCheck className="h-3 w-3" /> In Progress</Badge>;
      case 'closed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'billing':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Billing</Badge>;
      case 'delivery':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Delivery</Badge>;
      case 'refund':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Refund</Badge>;
      case 'inquiry':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Inquiry</Badge>;
      default:
        return <Badge variant="outline" className="capitalize">{category}</Badge>;
    }
  };

  const handleOpenTicket = (ticket: Ticket) => {
    setActiveTicket(ticket);
    setNewStatus(ticket.status);
    setNewPriority(ticket.priority);
  };

  const handleReplyToTicket = () => {
    if (!replyText.trim() || !activeTicket || isUpdating) return;
    
    setIsUpdating(true);
    
    // In a real app, you would send this to your backend
    setTimeout(() => {
      // Create a new message
      const newMessage: Message = {
        id: `msg${Date.now()}`,
        text: replyText,
        sender: user?.uid || 'employee',
        senderName: user?.displayName || user?.email || 'Support Agent',
        senderRole: 'employee',
        timestamp: new Date().toISOString(),
      };
      
      // Update the active ticket
      const updatedTicket: Ticket = {
        ...activeTicket,
        messages: [...activeTicket.messages, newMessage],
        updatedAt: new Date().toISOString(),
        status: newStatus as any,
        priority: newPriority as any,
        assignedTo: user?.uid || 'employee',
      };
      
      // Update the tickets list
      const updatedTickets = tickets.map(t => 
        t.id === activeTicket.id ? updatedTicket : t
      );
      
      setTickets(updatedTickets);
      setActiveTicket(updatedTicket);
      setReplyText('');
      setIsUpdating(false);
      
      toast.success('Reply sent successfully');
    }, 1000);
  };

  const formatMessageTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between mb-4">
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-10 w-1/4" />
        </div>
        
        <div className="flex gap-4 mb-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
        
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <LifeBuoy className="h-6 w-6" />
            Support Tickets
          </h1>
          <p className="text-muted-foreground">
            Manage and respond to client support requests
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/employee/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">All Tickets</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Filter and search controls */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ticket ID, subject or client name..."
              className="pl-9 pr-4"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Priority
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filter by priority</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {}}>
                All priorities
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                <Star className="h-4 w-4 mr-2 text-red-500" />
                High priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                <Star className="h-4 w-4 mr-2 text-orange-500" />
                Medium priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                <Star className="h-4 w-4 mr-2 text-green-500" />
                Low priority
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>
      
      {/* Tickets table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {filteredTickets.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleOpenTicket(ticket)}>
                      <TableCell className="font-mono font-medium">{ticket.id}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{ticket.subject}</TableCell>
                      <TableCell>{ticket.userName}</TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                      <TableCell>{getCategoryBadge(ticket.category)}</TableCell>
                      <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenTicket(ticket);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="pt-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">No tickets found</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                {searchTerm || statusFilter ? 
                  'No tickets match your current filters. Try adjusting your search criteria.' : 
                  'There are no support tickets to display yet.'}
              </p>
              {(searchTerm || statusFilter) && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter(null);
                  }}
                >
                  Reset Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </motion.div>
      
      {/* Ticket detail dialog */}
      <Dialog open={!!activeTicket} onOpenChange={(open) => !open && setActiveTicket(null)}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LifeBuoy className="h-5 w-5" />
              Ticket {activeTicket?.id}
            </DialogTitle>
            <DialogDescription>
              {activeTicket?.subject}
            </DialogDescription>
          </DialogHeader>
          
          {activeTicket && (
            <div className="flex flex-col h-full">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium">Client</p>
                  <p className="text-sm">{activeTicket.userName} ({activeTicket.userEmail})</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm">{formatDate(activeTicket.createdAt, true)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <div className="flex gap-2 items-center">
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger className="w-[130px] h-8 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Priority</p>
                  <div className="flex gap-2 items-center">
                    <Select value={newPriority} onValueChange={setNewPriority}>
                      <SelectTrigger className="w-[130px] h-8 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Category</p>
                  <div className="mt-1">
                    {getCategoryBadge(activeTicket.category)}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Assigned To</p>
                  <p className="text-sm">{activeTicket.assignedTo ? 'Support Agent' : 'Unassigned'}</p>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto border rounded-md p-4 mb-4 space-y-4">
                {activeTicket.messages.map((message, index) => (
                  <div key={message.id} className={`flex gap-3 ${message.senderRole === 'client' ? '' : 'flex-row-reverse'}`}>
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className={message.senderRole === 'client' ? 'bg-blue-500' : 'bg-green-500'}>
                        {message.senderRole === 'client' ? 'CL' : 'AG'}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`max-w-[80%] ${message.senderRole === 'client' ? '' : 'text-right'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`text-xs text-muted-foreground ${message.senderRole === 'client' ? 'order-last' : 'order-first'}`}>
                          {formatMessageTimestamp(message.timestamp)}
                        </p>
                        <p className="text-sm font-medium">{message.senderName}</p>
                      </div>
                      <div 
                        className={`px-4 py-3 rounded-lg ${
                          message.senderRole === 'client' ? 'bg-muted text-foreground' : 'bg-primary text-primary-foreground'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Your Reply</p>
                <Textarea 
                  placeholder="Type your reply here..."
                  className="min-h-[100px]"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveTicket(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleReplyToTicket}
              disabled={!replyText.trim() || isUpdating}
              className="gap-2"
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 