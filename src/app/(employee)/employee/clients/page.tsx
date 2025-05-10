'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { getAllUsers } from '@/lib/firebase/services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import {
  Users,
  Search,
  Filter,
  ChevronDown,
  Calendar,
  UserCheck,
  UserX,
  Mail,
  Phone,
  ArrowUpDown,
  SearchX,
  RefreshCw,
  Eye,
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

interface User {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;
  createdAt?: string;
  lastLogin?: string;
  isActive?: boolean;
  ordersCount?: number;
}

export default function EmployeeClientsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [clients, setClients] = useState<User[]>([]);
  const [filteredClients, setFilteredClients] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<{ field: string; direction: 'asc' | 'desc' }>({
    field: 'createdAt',
    direction: 'desc'
  });

  useEffect(() => {
    const fetchClients = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // In a real implementation, you would handle pagination and filtering
        const userData = await getAllUsers();
        
        // Add some computed properties for demo purposes
        const processedUsers = userData.map(u => ({
          ...u,
          isActive: Math.random() > 0.3, // Random activity status for demo
          ordersCount: Math.floor(Math.random() * 8) // Random order count for demo
        }));
        
        setClients(processedUsers);
        setFilteredClients(processedUsers);
      } catch (error) {
        console.error('Error fetching clients:', error);
        toast.error('Failed to load client data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClients();
  }, [user]);

  useEffect(() => {
    if (!clients.length) return;
    
    let result = [...clients];
    
    // Apply status filter
    if (statusFilter !== null) {
      result = result.filter(client => client.isActive === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(client => 
        client.displayName?.toLowerCase().includes(term) ||
        client.email?.toLowerCase().includes(term) ||
        client.phoneNumber?.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let valueA = a[sortBy.field as keyof User];
      let valueB = b[sortBy.field as keyof User];
      
      // Handle dates specially
      if (sortBy.field === 'createdAt' || sortBy.field === 'lastLogin') {
        valueA = valueA ? new Date(valueA).getTime() : 0;
        valueB = valueB ? new Date(valueB).getTime() : 0;
      }
      
      if (sortBy.direction === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    setFilteredClients(result);
  }, [clients, searchTerm, statusFilter, sortBy]);

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
            <Users className="h-6 w-6" />
            Clients
          </h1>
          <p className="text-muted-foreground">
            View and manage client information
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            setClients([]);
            setFilteredClients([]);
            setIsLoading(true);
            
            // Refetch clients
            getAllUsers().then(userData => {
              const processedUsers = userData.map(u => ({
                ...u,
                isActive: Math.random() > 0.3,
                ordersCount: Math.floor(Math.random() * 8)
              }));
              
              setClients(processedUsers);
              setFilteredClients(processedUsers);
              setIsLoading(false);
              toast.success('Client data refreshed');
            }).catch(error => {
              console.error('Error refreshing client data:', error);
              toast.error('Failed to refresh client data');
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
              placeholder="Search by name, email or phone..."
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
                  className={statusFilter === null ? "bg-accent" : ""}
                  onClick={() => setStatusFilter(null)}
                >
                  All clients
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={statusFilter === true ? "bg-accent" : ""}
                  onClick={() => setStatusFilter(true)}
                >
                  <UserCheck className="h-4 w-4 mr-2 text-green-500" />
                  Active clients
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={statusFilter === false ? "bg-accent" : ""}
                  onClick={() => setStatusFilter(false)}
                >
                  <UserX className="h-4 w-4 mr-2 text-red-500" />
                  Inactive clients
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
                  Newest clients first
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={sortBy.field === 'createdAt' && sortBy.direction === 'asc' ? "bg-accent" : ""}
                  onClick={() => setSortBy({ field: 'createdAt', direction: 'asc' })}
                >
                  Oldest clients first
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={sortBy.field === 'displayName' && sortBy.direction === 'asc' ? "bg-accent" : ""}
                  onClick={() => setSortBy({ field: 'displayName', direction: 'asc' })}
                >
                  Name (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={sortBy.field === 'displayName' && sortBy.direction === 'desc' ? "bg-accent" : ""}
                  onClick={() => setSortBy({ field: 'displayName', direction: 'desc' })}
                >
                  Name (Z-A)
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={sortBy.field === 'ordersCount' && sortBy.direction === 'desc' ? "bg-accent" : ""}
                  onClick={() => setSortBy({ field: 'ordersCount', direction: 'desc' })}
                >
                  Most orders
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Active filters */}
        {(statusFilter !== null || searchTerm) && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Active filters:</span>
            {statusFilter !== null && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Status: {statusFilter ? 'Active' : 'Inactive'}
                <UserX 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => setStatusFilter(null)}
                />
              </Badge>
            )}
            {searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {searchTerm}
                <UserX 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => setSearchTerm('')}
                />
              </Badge>
            )}
          </div>
        )}
      </motion.div>
      
      {/* Clients table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {filteredClients.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Member Since</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.uid} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/employee/clients/${client.uid}`)}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={client.photoURL || ''} alt={client.displayName} />
                            <AvatarFallback className={getRandomColor(client.uid)}>
                              {getInitials(client.displayName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{client.displayName}</p>
                            <p className="text-xs text-muted-foreground">{client.uid.slice(0, 8)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-2 text-muted-foreground" />
                            {client.email}
                          </div>
                          {client.phoneNumber && (
                            <div className="flex items-center text-sm">
                              <Phone className="h-3 w-3 mr-2 text-muted-foreground" />
                              {client.phoneNumber}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {client.createdAt ? (
                            formatDate(client.createdAt)
                          ) : (
                            <span className="text-muted-foreground">Not available</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {client.isActive ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{client.ordersCount}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/employee/clients/${client.uid}`);
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
                <SearchX className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">No clients found</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                {statusFilter !== null || searchTerm ? 
                  'No clients match your current filters. Try adjusting your search criteria.' : 
                  'There are no clients to display yet.'}
              </p>
              {(statusFilter !== null || searchTerm) && (
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
    </div>
  );
} 