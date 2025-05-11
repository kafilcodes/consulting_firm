'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { getAllUsers, updateUser } from '@/lib/firebase/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Search, 
  UserCog, 
  UserPlus, 
  MoreHorizontal, 
  Mail,
  User,
  UserCheck,
  Users,
  Shield,
  ShieldAlert,
  ArrowLeft
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
  email: string;
  displayName: string;
  role: 'client' | 'employee' | 'admin' | 'consultant';
  photoURL?: string;
  phoneNumber?: string;
  createdAt: string;
  isActive: boolean;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [changeRoleDialogOpen, setChangeRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<string>('');

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // In a real implementation, you would check if the current user has admin privileges
        const allUsers = await getAllUsers();
        setUsers(allUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, [user]);

  // Filter users
  const filteredUsers = users.filter(user => {
    // Role filter
    if (roleFilter !== 'all' && user.role !== roleFilter) {
      return false;
    }
    
    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.displayName?.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.uid.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const handleChangeRole = async () => {
    if (!selectedUser || !newRole) {
      toast.error('Please select a role');
      return;
    }
    
    try {
      await updateUser(selectedUser.uid, { role: newRole as any });
      
      // Update local state
      setUsers(prev => 
        prev.map(u => 
          u.uid === selectedUser.uid ? { ...u, role: newRole as any } : u
        )
      );
      
      toast.success(`Changed ${selectedUser.displayName}'s role to ${newRole}`);
      setChangeRoleDialogOpen(false);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const openChangeRoleDialog = (user: UserData) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setChangeRoleDialogOpen(true);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-100 text-red-800">Admin</Badge>;
      case 'employee':
        return <Badge className="bg-blue-100 text-blue-800">Employee</Badge>;
      case 'consultant':
        return <Badge className="bg-purple-100 text-purple-800">Consultant</Badge>;
      case 'client':
        return <Badge className="bg-green-100 text-green-800">Client</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6" />
            User Management
          </h1>
          <p className="text-muted-foreground">
            Manage users and their roles in your consulting platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/admin')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button onClick={() => router.push('/admin/users/invite')}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="client">Clients</SelectItem>
            <SelectItem value="employee">Employees</SelectItem>
            <SelectItem value="consultant">Consultants</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Manage users and update permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No users found</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                {searchTerm || roleFilter !== 'all' ? 
                  'No users match your search criteria. Try adjusting your filters.' : 
                  'There are no users in the system yet.'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((userData) => (
                    <TableRow key={userData.uid}>
                      <TableCell className="font-medium">
                        {userData.displayName || 'Unnamed User'}
                      </TableCell>
                      <TableCell>{userData.email}</TableCell>
                      <TableCell>{getRoleBadge(userData.role)}</TableCell>
                      <TableCell>{new Date(userData.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push(`/admin/users/${userData.uid}`)}>
                              <UserCheck className="h-4 w-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openChangeRoleDialog(userData)}>
                              <Shield className="h-4 w-4 mr-2" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/admin/users/${userData.uid}/security`)}>
                              <ShieldAlert className="h-4 w-4 mr-2" />
                              Security Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-500 focus:text-red-500"
                              onClick={() => toast.error('This functionality is not implemented in the demo')}
                            >
                              Disable Account
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
      
      <Dialog open={changeRoleDialogOpen} onOpenChange={setChangeRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role and permissions for this user.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">User</p>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{selectedUser?.displayName || 'Unnamed User'}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                Role
              </label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="consultant">Consultant</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              
              <p className="text-xs text-muted-foreground mt-2">
                {newRole === 'admin' ? (
                  <span className="text-red-500">Warning: Admins have full access to all system features and data.</span>
                ) : newRole === 'employee' ? (
                  'Employees can manage orders, communicate with clients, and access employee-specific features.'
                ) : newRole === 'consultant' ? (
                  'Consultants can offer premium services and provide one-on-one consultations.'
                ) : (
                  'Clients can browse services, create orders, and communicate with employees.'
                )}
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangeRole}>
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 