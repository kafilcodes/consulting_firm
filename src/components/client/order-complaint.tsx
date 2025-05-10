import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { AlertTriangle, FileWarning, Paperclip, X, Send, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { submitOrderComplaint, submitOrderComplaintWithAttachment, getOrderComplaints, OrderComplaint } from '@/lib/firebase/services';

interface OrderComplaintProps {
  orderId: string;
  serviceName: string;
}

export function OrderComplaintForm({ orderId, serviceName }: OrderComplaintProps) {
  const { user } = useAuth();
  const [complaintType, setComplaintType] = useState<string>('');
  const [description, setDescription] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    setIsSuccess(false);
    setError(null);
    setComplaintType('');
    setDescription('');
    setAttachmentFile(null);
  };
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };
  
  const handleAttachFile = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        toast.error('File too large. Maximum file size is 20MB');
        return;
      }
      
      setAttachmentFile(file);
      toast.success(`File "${file.name}" attached`);
    }
  };
  
  const handleRemoveAttachment = () => {
    setAttachmentFile(null);
  };
  
  const handleSubmitComplaint = async () => {
    if (!user) {
      toast.error('You need to be signed in to submit a complaint');
      return;
    }
    
    if (!complaintType) {
      toast.error('Please select a complaint type');
      return;
    }
    
    if (!description.trim()) {
      toast.error('Please provide a description of your complaint');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const complaintData = {
        orderId,
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'User',
        userEmail: user.email || '',
        complaintType: complaintType as any,
        description: description.trim()
      };
      
      let complaintId;
      
      // If we have an attachment, submit with attachment
      if (attachmentFile) {
        complaintId = await submitOrderComplaintWithAttachment(complaintData, attachmentFile);
      } else {
        complaintId = await submitOrderComplaint(complaintData);
      }
      
      setIsSuccess(true);
      toast.success('Your complaint has been submitted');
      
      // Clear form
      setComplaintType('');
      setDescription('');
      setAttachmentFile(null);
      
      // Close dialog after a delay
      setTimeout(() => {
        setIsDialogOpen(false);
      }, 3000);
      
    } catch (err) {
      console.error('Error submitting complaint:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit complaint');
      toast.error('Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getComplaintTypeLabel = (type: string): string => {
    switch (type) {
      case 'wrong-work': return 'Wrong Work Done';
      case 'delayed': return 'Delayed Service';
      case 'poor-quality': return 'Poor Quality';
      case 'billing-issue': return 'Billing Issue';
      case 'other': return 'Other Issue';
      default: return type;
    }
  };
  
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full flex items-center gap-2"
          onClick={handleOpenDialog}
        >
          <AlertTriangle className="h-4 w-4" />
          Report an Issue
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileWarning className="h-5 w-5 text-destructive" />
            Report an Issue
          </DialogTitle>
          <DialogDescription>
            Submit a complaint about your order for {serviceName}
          </DialogDescription>
        </DialogHeader>
        
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-4"
            >
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Complaint Submitted Successfully</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your complaint has been recorded. We will review it and get back to you as soon as possible.
                </AlertDescription>
              </Alert>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 py-4"
            >
              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <label htmlFor="complaintType" className="text-sm font-medium">
                  Type of Issue
                </label>
                <Select 
                  onValueChange={(value) => setComplaintType(value)}
                  value={complaintType} 
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="complaintType" className="w-full">
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wrong-work">Work done incorrectly</SelectItem>
                    <SelectItem value="delayed">Service delayed</SelectItem>
                    <SelectItem value="poor-quality">Poor quality of work</SelectItem>
                    <SelectItem value="billing-issue">Billing issue</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe your issue in detail..."
                  rows={5}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Attachments (Optional)
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAttachFile}
                    disabled={isSubmitting}
                    className="text-xs"
                  >
                    <Paperclip className="mr-1 h-3 w-3" />
                    Attach File
                  </Button>
                </div>
                
                {attachmentFile && (
                  <div className="flex items-center justify-between bg-muted p-2 rounded-md mt-2">
                    <span className="text-sm truncate max-w-[80%]">{attachmentFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveAttachment}
                      disabled={isSubmitting}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground">
                  Max file size: 20MB. Accepted formats: PDF, JPG, PNG, DOC, DOCX.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <DialogFooter>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
          
          {isSuccess ? (
            <Button onClick={handleCloseDialog}>Close</Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitComplaint} 
                disabled={isSubmitting || !complaintType || !description.trim()}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Complaint
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function OrderComplaintHistory({ orderId }: { orderId: string }) {
  const [complaints, setComplaints] = useState<OrderComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedComplaints = await getOrderComplaints(orderId);
        setComplaints(fetchedComplaints);
      } catch (err) {
        console.error('Error fetching complaints:', err);
        setError('Failed to load complaint history');
      } finally {
        setLoading(false);
      }
    };
    
    fetchComplaints();
  }, [orderId]);
  
  if (loading) {
    return <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileWarning className="h-5 w-5" />
          Complaint History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center text-sm text-muted-foreground py-4">
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          Loading complaint history...
        </div>
      </CardContent>
    </Card>;
  }
  
  if (error) {
    return <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileWarning className="h-5 w-5" />
          Complaint History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setLoading(true);
              getOrderComplaints(orderId)
                .then(fetchedComplaints => {
                  setComplaints(fetchedComplaints);
                  setError(null);
                })
                .catch(err => {
                  console.error('Error fetching complaints:', err);
                  setError('Failed to load complaint history');
                })
                .finally(() => setLoading(false));
            }}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </CardContent>
    </Card>;
  }
  
  if (complaints.length === 0) {
    return <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileWarning className="h-5 w-5" />
          Complaint History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-center text-muted-foreground py-4">
          No complaints have been submitted for this order.
        </div>
      </CardContent>
    </Card>;
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Submitted</Badge>;
      case 'under-review':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Under Review</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Resolved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch (err) {
      return dateString;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileWarning className="h-5 w-5" />
          Complaint History ({complaints.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <motion.div
              key={complaint.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="border rounded-lg p-4 hover:border-primary/30 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">{getComplaintTypeLabel(complaint.complaintType)}</h4>
                  <p className="text-xs text-muted-foreground">
                    Submitted on {formatDate(complaint.createdAt as string)}
                  </p>
                </div>
                {getStatusBadge(complaint.status)}
              </div>
              
              <p className="text-sm mt-2">{complaint.description}</p>
              
              {complaint.attachments && complaint.attachments.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-xs font-medium mb-1">Attachments:</h5>
                  <div className="space-y-1">
                    {complaint.attachments.map((attachment, i) => (
                      <a
                        key={i}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-primary hover:underline"
                      >
                        <Paperclip className="h-3 w-3" />
                        {attachment.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              {complaint.resolution && (
                <div className="mt-3 bg-muted p-3 rounded-md">
                  <h5 className="text-xs font-medium mb-1">Resolution:</h5>
                  <p className="text-sm">{complaint.resolution}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 