'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  FileText,
  MessageSquare,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  getAllOrders,
  getOrdersByStatus,
  updateOrderStatus,
  deleteOrder,
  getOrderMessages
} from '@/lib/firebase/services';
import { Order, OrderStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow, format } from 'date-fns';

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, userRole, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewMessagesDialogOpen, setIsViewMessagesDialogOpen] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');
  const [statusNote, setStatusNote] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [orderMessages, setOrderMessages] = useState<any[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || userRole !== 'admin')) {
      router.push('/auth/signin');
      return;
    }

    const fetchOrders = async () => {
      try {
        let fetchedOrders: Order[] = [];
        
        if (activeTab === 'all') {
          fetchedOrders = await getAllOrders();
        } else {
          fetchedOrders = await getOrdersByStatus(activeTab as OrderStatus);
        }
        
        setOrders(fetchedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      }
    };

    if (user && userRole === 'admin') {
      fetchOrders();
    }
  }, [user, userRole, isLoading, router, activeTab]);

  // Apply filtering, sorting and pagination
  useEffect(() => {
    // First apply search filter
    let result = [...orders];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        order => 
          (order.id && order.id.toLowerCase().includes(query)) ||
          (order.serviceName && order.serviceName.toLowerCase().includes(query)) ||
          (order.userName && order.userName.toLowerCase().includes(query)) ||
          (order.userEmail && order.userEmail.toLowerCase().includes(query)) ||
          (order.status && order.status.toLowerCase().includes(query))
      );
    }
    
    // Then sort
    result.sort((a, b) => {
      let valueA, valueB;
      
      if (sortBy === 'createdAt') {
        valueA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        valueB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      } else if (sortBy === 'updatedAt') {
        valueA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        valueB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      } else if (sortBy === 'serviceName') {
        valueA = a.serviceName || '';
        valueB = b.serviceName || '';
      } else if (sortBy === 'userName') {
        valueA = a.userName || '';
        valueB = b.userName || '';
      } else if (sortBy === 'amount') {
        valueA = a.amount || 0;
        valueB = b.amount || 0;
      } else {
        valueA = a.status || '';
        valueB = b.status || '';
      }
      
      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    // Calculate total pages
    setTotalPages(Math.ceil(result.length / pageSize));
    
    // Apply pagination
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedResult = result.slice(startIndex, startIndex + pageSize);
    
    setFilteredOrders(paginatedResult);
  }, [orders, searchQuery, sortBy, sortDirection, currentPage, pageSize]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const handleUpdateStatus = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusNote('');
    setIsStatusDialogOpen(true);
  };

  const handleConfirmStatusUpdate = async () => {
    if (!selectedOrder) return;
    
    try {
      await updateOrderStatus(
        selectedOrder.id, 
        newStatus, 
        user?.uid || 'admin', 
        statusNote
      );
      
      // Update the order in the local state
      setOrders(prev => prev.map(o => 
        o.id === selectedOrder.id 
          ? { ...o, status: newStatus, updatedAt: new Date() }
          : o
      ));
      
      toast.success(`Order status updated to ${newStatus}`);
      setIsStatusDialogOpen(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleViewMessages = async (order: Order) => {
    setSelectedOrder(order);
    setIsLoadingMessages(true);
    setIsViewMessagesDialogOpen(true);
    
    try {
      const messages = await getOrderMessages(order.id);
      setOrderMessages(messages);
    } catch (error) {
      console.error('Error fetching order messages:', error);
      toast.error('Failed to load order messages');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleDeleteOrder = (order: Order) => {
    setSelectedOrder(order);
    setConfirmationCode('');
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedOrder) return;
    
    try {
      // Verify confirmation code against environment variable
      if (confirmationCode !== process.env.NEXT_PUBLIC_SKS_CODE) {
        toast.error('Invalid confirmation code');
        return;
      }
      
      setIsDeleting(true);
      await deleteOrder(selectedOrder.id);
      
      // Remove the order from the local state
      setOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
      
      toast.success('Order deleted successfully');
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders Management</h1>
          <p className="text-muted-foreground">
            Manage all client orders, update statuses, and track progress.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders..."
              className="pl-8 w-full md:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="w-[180px]"
          >
            <option value="createdAt">Created Date</option>
            <option value="updatedAt">Updated Date</option>
            <option value="serviceName">Service</option>
            <option value="userName">Customer</option>
            <option value="amount">Amount</option>
            <option value="status">Status</option>
          </Select>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            title={sortDirection === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <CardTitle>Orders</CardTitle>
              <div className="flex items-center space-x-2">
                <Select 
                  value={pageSize.toString()}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-[80px]"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead className="w-[200px]">
                      <div 
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort('serviceName')}
                      >
                        Service
                        {sortBy === 'serviceName' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead>
                      <div 
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort('userName')}
                      >
                        Customer
                        {sortBy === 'userName' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead>
                      <div 
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort('amount')}
                      >
                        Amount
                        {sortBy === 'amount' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead>
                      <div 
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort('status')}
                      >
                        Status
                        {sortBy === 'status' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead>
                      <div 
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort('createdAt')}
                      >
                        Created
                        {sortBy === 'createdAt' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order, index) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {(currentPage - 1) * pageSize + index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{order.serviceName || 'Unknown Service'}</div>
                          <div className="text-xs text-muted-foreground">
                            ID: {order.id.slice(0, 8)}...
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>{order.userName || 'Unknown User'}</div>
                          <div className="text-xs text-muted-foreground">
                            {order.userEmail || 'No email'}
                          </div>
                        </TableCell>
                        <TableCell>₹{order.amount?.toLocaleString() || 0}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          {order.createdAt ? 
                            formatDistanceToNow(new Date(order.createdAt), { addSuffix: true }) :
                            'Unknown'
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/admin/orders/${order.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewMessages(order)}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                View Messages
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(order)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Update Status
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteOrder(order)}
                                className="text-red-600"
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete Order
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center p-4">
                        {searchQuery.trim() 
                          ? 'No orders found for your search query' 
                          : 'No orders found for this status'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between px-6 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredOrders.length} of {orders.length} orders
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </PaginationItem>
                
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <PaginationItem key={i}>
                      <Button
                        variant={currentPage === pageNumber ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => handlePageChange(pageNumber)}
                      >
                        {pageNumber}
                      </Button>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        </Card>
      </Tabs>

      {/* Update Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status of order #{selectedOrder?.id.slice(0, 8)} and add a note.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as OrderStatus)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a status" />
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="statusNote" className="text-right">
                Note
              </Label>
              <Textarea
                id="statusNote"
                placeholder="Add a note about this status change"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmStatusUpdate}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Messages Dialog */}
      <Dialog open={isViewMessagesDialogOpen} onOpenChange={setIsViewMessagesDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Messages</DialogTitle>
            <DialogDescription>
              Communication history for order #{selectedOrder?.id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isLoadingMessages ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : orderMessages.length > 0 ? (
              <div className="space-y-4">
                {orderMessages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg ${
                      message.sender.role === 'client' 
                        ? 'bg-blue-50 ml-12' 
                        : 'bg-gray-50 mr-12'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium">{message.sender.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {message.timestamp ? format(new Date(message.timestamp), 'PPp') : ''}
                      </div>
                    </div>
                    <p className="text-sm">{message.text}</p>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs font-medium mb-1">Attachments:</div>
                        <div className="flex flex-wrap gap-2">
                          {message.attachments.map((attachment, i) => (
                            <a
                              key={i}
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center"
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              {attachment.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No messages found for this order
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewMessagesDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Order Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All order details and messages will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="deleteConfirmationCode">
                Enter the confirmation code to delete this order:
              </Label>
              <Input
                id="deleteConfirmationCode"
                type="password"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                placeholder="Enter confirmation code"
              />
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Warning:</p>
                <p>Deleting an order is permanent and will remove all related data including messages, documents, and payment records.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 