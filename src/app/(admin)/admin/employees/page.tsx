'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { getUsersByRole, updateUserRole, deleteUser } from '@/lib/firebase/services';
import { User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { format, isValid } from 'date-fns';
import { Search, MoreHorizontal, Edit, Trash, Eye, UserPlus, UserMinus, CheckCircle, Mail, Users } from 'lucide-react';

const formatDate = (dateValue: any): string => {
  if (!dateValue) return 'Unknown';
  
  try {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    return isValid(date) ? format(date, 'PP') : 'Invalid date';
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

export default function EmployeeManagementPage() {
  const router = useRouter();
  const { user, userRole, isLoading: authLoading } = useAuth();
  const [employees, setEmployees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [activeTab, setActiveTab] = useState('employees');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || userRole !== 'admin')) {
      router.push('/auth/signin');
      return;
    }

    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const data = await getUsersByRole('employee');
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error('Failed to load employees');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && userRole === 'admin') {
      fetchEmployees();
    }
  }, [user, userRole, authLoading, router]);

  const handleDelete = (employee: User) => {
    setSelectedEmployee(employee);
    setConfirmationCode('');
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEmployee) return;
    
    try {
      // Check if confirmation code matches environment variable
      if (confirmationCode !== process.env.NEXT_PUBLIC_SKS_CODE) {
        toast.error('Invalid confirmation code');
        return;
      }
      
      await deleteUser(selectedEmployee.uid);
      
      // Update local state
      setEmployees(prev => prev.filter(e => e.uid !== selectedEmployee.uid));
      
      toast.success('Employee deleted successfully');
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
    }
  };

  // Filter employees based on search term
  const filteredEmployees = employees.filter(employee => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (employee.displayName?.toLowerCase().includes(searchLower) || false) ||
      (employee.email?.toLowerCase().includes(searchLower) || false) ||
      employee.uid.toLowerCase().includes(searchLower)
    );
  });

  const getInitials = (name: string | null) => {
    if (!name) return 'EM';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleViewEmployee = (employee: User) => {
    setSelectedEmployee(employee);
    setIsViewDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employee Management</h1>
          <p className="text-muted-foreground">
            Manage employees, update their details, and control access
          </p>
        </div>
        <Button onClick={() => router.push('/admin/employees/create')}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add New Employee
        </Button>
      </div>

      <Tabs defaultValue="employees" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="employees">Current Employees</TabsTrigger>
          <TabsTrigger value="add">Add Employee</TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <div className="flex gap-4 items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees by name, email..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Employees ({filteredEmployees.length})</CardTitle>
              <CardDescription>
                View and manage all employees in your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredEmployees.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No employees found</h3>
                  <p className="text-muted-foreground text-center max-w-sm">
                    {searchTerm ? 
                      'No employees match your search criteria. Try adjusting your search term.' : 
                      'There are no employees created yet. Click the "Add New Employee" button to add one.'}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Last Sign In</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.map((employee) => (
                        <TableRow key={employee.uid}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={employee.photoURL || undefined} alt={employee.displayName || "Employee"} />
                                <AvatarFallback>{getInitials(employee.displayName)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{employee.displayName || 'Unnamed Employee'}</div>
                                <div className="text-xs text-muted-foreground">ID: {employee.uid.slice(0, 8)}...</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{employee.email}</TableCell>
                          <TableCell>{formatDate(employee.createdAt)}</TableCell>
                          <TableCell>{employee.lastSignInTime ? formatDate(employee.lastSignInTime) : 'Never'}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => handleViewEmployee(employee)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => router.push(`/admin/employees/edit/${employee.uid}`)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    window.location.href = `mailto:${employee.email}`;
                                  }}
                                >
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send Email
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(employee)}
                                  className="text-red-600"
                                >
                                  <Trash className="h-4 w-4 mr-2" />
                                  Remove Employee
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <AddEmployeeTab setActiveTab={setActiveTab} />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Remove Employee</DialogTitle>
            <DialogDescription>
              This action will remove the employee role from this user and possibly delete their account.
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Employee to remove:</p>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedEmployee?.photoURL || undefined} alt={selectedEmployee?.displayName || "Employee"} />
                  <AvatarFallback>{selectedEmployee ? getInitials(selectedEmployee.displayName) : 'EM'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedEmployee?.displayName || 'Unnamed Employee'}</p>
                  <p className="text-sm text-muted-foreground">{selectedEmployee?.email}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmationCode" className="text-sm font-medium">
                Enter confirmation code:
              </label>
              <Input
                id="confirmationCode"
                placeholder="Enter confirmation code"
                type="password"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Please enter the confirmation code to proceed with employee removal.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Remove Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Employee Details Dialog */}
      {selectedEmployee && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Employee Details</DialogTitle>
              <DialogDescription>
                Comprehensive information about this employee
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedEmployee.photoURL} alt={selectedEmployee.displayName} />
                    <AvatarFallback>{selectedEmployee.displayName?.charAt(0) || 'E'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedEmployee.displayName}</h3>
                    <p className="text-muted-foreground">{selectedEmployee.email}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Role</h4>
                    <p className="capitalize">{selectedEmployee.role || 'Employee'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                    <Badge variant={selectedEmployee.isActive ? "success" : "secondary"}>
                      {selectedEmployee.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Phone</h4>
                    <p>{selectedEmployee.phoneNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Department</h4>
                    <p>{selectedEmployee.department || 'Not assigned'}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Employee ID</h4>
                  <p className="font-mono">{selectedEmployee.id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Joined Date</h4>
                  <p>{selectedEmployee.createdAt ? formatDate(selectedEmployee.createdAt) : 'Unknown'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Last Sign In</h4>
                  <p>{selectedEmployee.lastSignInTime ? formatDate(selectedEmployee.lastSignInTime) : 'Never'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Specializations</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedEmployee.specializations?.length > 0 ? (
                      selectedEmployee.specializations.map((spec: string, i: number) => (
                        <Badge key={i} variant="outline">{spec}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No specializations listed</p>
                    )}
                  </div>
                </div>
                {selectedEmployee.bio && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Bio</h4>
                    <p className="text-sm">{selectedEmployee.bio}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-medium mb-3">Performance Metrics</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedEmployee.completedOrders || 0}</div>
                      <p className="text-sm text-muted-foreground">Completed Orders</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedEmployee.activeOrders || 0}</div>
                      <p className="text-sm text-muted-foreground">Active Orders</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {selectedEmployee.rating ? selectedEmployee.rating.toFixed(1) : 'N/A'}
                      </div>
                      <p className="text-sm text-muted-foreground">Average Rating</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setIsViewDialogOpen(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setIsViewDialogOpen(false);
                  // Add edit functionality here
                }}
              >
                Edit Employee
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Component for adding new employees (converting clients to employees)
function AddEmployeeTab({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [clients, setClients] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true);
        const data = await getUsersByRole('client');
        setClients(data);
      } catch (error) {
        console.error('Error fetching clients:', error);
        toast.error('Failed to load clients');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  const filteredClients = clients.filter(client => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (client.displayName?.toLowerCase().includes(searchLower) || false) ||
      (client.email?.toLowerCase().includes(searchLower) || false) ||
      client.uid.toLowerCase().includes(searchLower)
    );
  });

  const handlePromoteToEmployee = (client: User) => {
    setSelectedClient(client);
    setConfirmationCode('');
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmPromotion = async () => {
    if (!selectedClient) return;
    
    try {
      // Check if confirmation code matches environment variable
      if (confirmationCode !== process.env.NEXT_PUBLIC_SKS_CODE) {
        toast.error('Invalid confirmation code');
        return;
      }
      
      setIsProcessing(true);
      await updateUserRole(selectedClient.uid, 'employee');
      
      toast.success(`${selectedClient.displayName || 'Client'} promoted to employee successfully`);
      setIsConfirmDialogOpen(false);
      setActiveTab('employees');
    } catch (error) {
      console.error('Error promoting client to employee:', error);
      toast.error('Failed to promote client to employee');
    } finally {
      setIsProcessing(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'CL';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-4 items-center mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients by name, email..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Clients ({filteredClients.length})</CardTitle>
          <CardDescription>
            Select a client to promote to employee status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No clients found</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                {searchTerm ? 
                  'No clients match your search criteria. Try adjusting your search term.' : 
                  'There are no clients registered in the system yet.'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Sign In</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.uid}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={client.photoURL || undefined} alt={client.displayName || "Client"} />
                            <AvatarFallback>{getInitials(client.displayName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{client.displayName || 'Unnamed Client'}</div>
                            <div className="text-xs text-muted-foreground">ID: {client.uid.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{formatDate(client.createdAt)}</TableCell>
                      <TableCell>{client.lastSignInTime ? formatDate(client.lastSignInTime) : 'Never'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePromoteToEmployee(client)}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Promote to Employee
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Promotion Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Promote to Employee</DialogTitle>
            <DialogDescription>
              This action will change the selected client's role to employee, granting them
              access to employee features and dashboards.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Client to promote:</p>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedClient?.photoURL || undefined} alt={selectedClient?.displayName || "Client"} />
                  <AvatarFallback>{selectedClient ? getInitials(selectedClient.displayName) : 'CL'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedClient?.displayName || 'Unnamed Client'}</p>
                  <p className="text-sm text-muted-foreground">{selectedClient?.email}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmationCode" className="text-sm font-medium">
                Enter confirmation code:
              </label>
              <Input
                id="confirmationCode"
                placeholder="Enter confirmation code"
                type="password"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Please enter the confirmation code to promote this client to an employee.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmPromotion} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Promote to Employee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 