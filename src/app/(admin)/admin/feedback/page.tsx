'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { getAllFeedback, deleteFeedback } from '@/lib/firebase/services';
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
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Search, MoreHorizontal, Trash, Eye, MessageCircle, Star } from 'lucide-react';

// Feedback interface
interface Feedback {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  message: string;
  category: string;
  createdAt: string | Date;
}

export default function FeedbackManagementPage() {
  const router = useRouter();
  const { user, userRole, isLoading: authLoading } = useAuth();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || userRole !== 'admin')) {
      router.push('/auth/signin');
      return;
    }

    const fetchFeedback = async () => {
      try {
        setIsLoading(true);
        const data = await getAllFeedback();
        setFeedback(data);
      } catch (error) {
        console.error('Error fetching feedback:', error);
        toast.error('Failed to load feedback');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && userRole === 'admin') {
      fetchFeedback();
    }
  }, [user, userRole, authLoading, router]);

  const handleDelete = (feedbackItem: Feedback) => {
    setSelectedFeedback(feedbackItem);
    setConfirmationCode('');
    setIsDeleteDialogOpen(true);
  };

  const handleView = (feedbackItem: Feedback) => {
    setSelectedFeedback(feedbackItem);
    setIsViewDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedFeedback) return;
    
    try {
      // Check if confirmation code matches environment variable
      if (confirmationCode !== process.env.NEXT_PUBLIC_SKS_CODE) {
        toast.error('Invalid confirmation code');
        return;
      }
      
      await deleteFeedback(selectedFeedback.id);
      
      // Update local state
      setFeedback(prev => prev.filter(f => f.id !== selectedFeedback.id));
      
      toast.success('Feedback deleted successfully');
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast.error('Failed to delete feedback');
    }
  };

  // Filter feedback based on search term
  const filteredFeedback = feedback.filter(feedbackItem => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (feedbackItem.userName && feedbackItem.userName.toLowerCase().includes(searchLower)) ||
      (feedbackItem.userEmail && feedbackItem.userEmail.toLowerCase().includes(searchLower)) ||
      (feedbackItem.message && feedbackItem.message.toLowerCase().includes(searchLower)) ||
      (feedbackItem.category && feedbackItem.category.toLowerCase().includes(searchLower))
    );
  });

  // Sort feedback by date (newest first)
  filteredFeedback.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  const getRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
        />
      );
    }
    return <div className="flex">{stars}</div>;
  };

  const getCategoryBadge = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'general':
        return <Badge variant="outline">General</Badge>;
      case 'service':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Service</Badge>;
      case 'suggestion':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Suggestion</Badge>;
      case 'complaint':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Complaint</Badge>;
      case 'bug':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Bug</Badge>;
      default:
        return <Badge variant="outline">{category || 'Other'}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between">
          <Skeleton className="h-8 w-52" />
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
          <h1 className="text-2xl font-bold tracking-tight">Feedback Management</h1>
          <p className="text-muted-foreground">
            View and manage all feedback from users
          </p>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search feedback by user, content..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>User Feedback ({filteredFeedback.length})</CardTitle>
          <CardDescription>
            All feedback submitted by users across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredFeedback.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No feedback found</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                {searchTerm ? 
                  'No feedback matches your search criteria. Try adjusting your search term.' : 
                  'There is no feedback submitted by users yet.'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">User</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="w-[300px]">Feedback</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFeedback.map((feedbackItem) => (
                    <TableRow key={feedbackItem.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{feedbackItem.userName || 'Anonymous'}</div>
                          <div className="text-xs text-muted-foreground">{feedbackItem.userEmail || 'No email'}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getRatingStars(feedbackItem.rating)}</TableCell>
                      <TableCell>{getCategoryBadge(feedbackItem.category)}</TableCell>
                      <TableCell>
                        <p className="truncate max-w-[300px]">
                          {feedbackItem.message}
                        </p>
                      </TableCell>
                      <TableCell>
                        {feedbackItem.createdAt ? 
                          (typeof feedbackItem.createdAt === 'string' ? 
                            format(new Date(feedbackItem.createdAt), 'PP') : 
                            format(feedbackItem.createdAt, 'PP')
                          ) : 'Unknown'
                        }
                      </TableCell>
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
                              onClick={() => handleView(feedbackItem)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(feedbackItem)}
                              className="text-red-600"
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Delete Feedback
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

      {/* View Feedback Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
            <DialogDescription>
              View complete feedback information
            </DialogDescription>
          </DialogHeader>
          
          {selectedFeedback && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">User Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedFeedback.userName || 'Anonymous'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedFeedback.userEmail || 'No email'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">User ID</p>
                    <p className="font-mono text-sm">{selectedFeedback.userId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Submission Date</p>
                    <p className="font-medium">
                      {selectedFeedback.createdAt ? 
                        (typeof selectedFeedback.createdAt === 'string' ? 
                          format(new Date(selectedFeedback.createdAt), 'PPpp') : 
                          format(selectedFeedback.createdAt, 'PPpp')
                        ) : 'Unknown'
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Feedback Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <div className="mt-1">{getCategoryBadge(selectedFeedback.category)}</div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                    <div className="mt-1">{getRatingStars(selectedFeedback.rating)}</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Feedback Message</h3>
                <div className="p-3 bg-muted rounded-md">
                  <p className="whitespace-pre-wrap">{selectedFeedback.message}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                setIsViewDialogOpen(false);
                if (selectedFeedback) {
                  handleDelete(selectedFeedback);
                }
              }}
            >
              Delete Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Feedback</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the feedback
              from the database.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Feedback from:</p>
              <p className="font-bold">{selectedFeedback?.userName || 'Anonymous'}</p>
              <p className="text-sm text-muted-foreground">{selectedFeedback?.userEmail || 'No email'}</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmationCode" className="text-sm font-medium">
                Enter confirmation code to delete:
              </label>
              <Input
                id="confirmationCode"
                placeholder="Enter confirmation code"
                type="password"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Please enter the confirmation code to proceed with deletion.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 