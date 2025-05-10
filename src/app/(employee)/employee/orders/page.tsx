'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { getRecentOrders, updateOrderStatus } from '@/lib/firebase/services';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import {
  ClipboardList,
  Search,
  Filter,
  ChevronDown,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Package,
  FileText,
  AlertCircle,
  SearchX,
  RefreshCw,
  Eye,
  Calendar,
  Loader2,
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
  serviceId: string;
  serviceName: string;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  amount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  timeline: any[];
}

export default function EmployeeOrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updateStatusDialogOpen, setUpdateStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusUpdateMessage, setStatusUpdateMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [sortBy, setSortBy] = useState<{ field: string; direction: 'asc' | 'desc' }>({
    field: 'createdAt',
    direction: 'desc'
  });

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // In a real implementation, you would fetch only orders assigned to this employee
        // For now, we'll get all recent orders
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
        order.userName.toLowerCase().includes(term) ||
        order.id.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let valueA = a[sortBy.field as keyof Order];
      let valueB = b[sortBy.field as keyof Order];
      
      // Handle dates specially
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
    if (!selectedOrder || !newStatus || !statusUpdateMessage.trim()) {
      toast.error('Please provide all required information');
      return;
    }
    
    setIsUpdating(true);
    try {
      await updateOrderStatus(
        selectedOrder.id,
        newStatus as any,
        statusUpdateMessage,
        user?.displayName || user?.email || 'Employee'
      );
      
      // Update the order in the local state
      const updatedOrders = orders.map(order => {
        if (order.id === selectedOrder.id) {
          return {
            ...order,
            status: newStatus as any,
            updatedAt: new Date().toISOString(),
            timeline: [
              ...order.timeline,
              {
                status: newStatus,
                message: statusUpdateMessage,
                timestamp: new Date().toISOString(),
                updatedBy: user?.displayName || user?.email || 'Employee'
              }
            ]
          };
        }
        return order;
      });
      
      setOrders(updatedOrders);
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
            <ClipboardList className="h-6 w-6" />
            Manage Orders
          </h1>
          <p className="text-muted-foreground">
            View and process client orders
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            setOrders([]);
            setFilteredOrders([]);
            setIsLoading(true);
            
            // Refetch orders
            getRecentOrders(50).then(allOrders => {
              setOrders(allOrders);
              setFilteredOrders(allOrders);
              setIsLoading(false);
              toast.success('Orders refreshed');
            }).catch(error => {
              console.error('Error refreshing orders:', error);
              toast.error('Failed to refresh orders');
              setIsLoading(false);
            });
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => router.push('/employee/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
      
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
              placeholder="Search by service name, client or order ID..."
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
      </motion.div>
      
      {/* Orders table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {filteredOrders.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.serviceName}</TableCell>
                      <TableCell>{order.userName}</TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{formatCurrency(order.amount, order.currency)}</TableCell>
                      <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setNewStatus(order.status);
                              setUpdateStatusDialogOpen(true);
                            }}
                          >
                            Update Status
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/employee/orders/${order.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
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
                <SearchX className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">No orders found</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                {statusFilter || searchTerm ? 
                  'No orders match your current filters. Try adjusting your search criteria.' : 
                  'There are no orders to display yet.'}
              </p>
              {(statusFilter || searchTerm) && (
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
                <span className="font-medium">{selectedOrder?.serviceName}</span> - {selectedOrder?.userName}
              </p>
              <p className="text-sm text-muted-foreground">
                Current Status: {selectedOrder?.status}
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