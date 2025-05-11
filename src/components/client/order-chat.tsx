import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Send, Paperclip, Image, FileImage, File, X, Check, CheckCheck, Clock, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';
import { useVirtualizer } from '@tanstack/react-virtual';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getOrderMessages, sendOrderMessage, sendOrderMessageWithAttachment, markOrderMessagesAsRead, OrderMessage } from '@/lib/firebase/services';

interface OrderChatProps {
  orderId: string;
  orderStatus: string;
  employeeName?: string;
}

export function OrderChat({ orderId, orderStatus, employeeName }: OrderChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isScrolledToBottom = useRef(true);
  const typingTimeoutRef = useRef<any>(null);
  
  // Fetch messages on mount and when orderId changes or retryCount changes
  useEffect(() => {
    if (!orderId || !user) return;
    
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const fetchedMessages = await getOrderMessages(orderId);
        setMessages(fetchedMessages);
        
        // Simulate typing indicator if there are messages and the last one is not from the user
        if (fetchedMessages.length > 0 && 
            fetchedMessages[fetchedMessages.length - 1].senderId !== user.uid && 
            Math.random() > 0.7) {
          setIsTyping(true);
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
          }, 3000);
        }
        
        // Mark messages as read (don't await this to improve perceived performance)
        markOrderMessagesAsRead(orderId, user.uid).catch(err => {
          console.error('Background error marking messages as read:', err);
        });
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMessages();
    
    // Set up polling for new messages every 15 seconds
    const intervalId = setInterval(() => {
      if (!isLoading && !isSending) {
        fetchMessages();
      }
    }, 15000);
    
    return () => {
      clearInterval(intervalId);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [orderId, user, retryCount]);
  
  // Scroll to bottom when messages change or typing indicator appears/disappears
  useEffect(() => {
    if (messagesEndRef.current && isScrolledToBottom.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'end',
        inline: 'nearest'
      });
    }
  }, [messages, isTyping]);
  
  // Handle scroll events to track if user is at bottom
  const handleScroll = () => {
    if (!scrollAreaRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
    // Consider "at bottom" if within 100px of the bottom
    isScrolledToBottom.current = scrollHeight - scrollTop - clientHeight < 100;
  };
  
  const handleSendMessage = async () => {
    if (!messageInput.trim() && !attachmentFile) return;
    if (!user) {
      toast.error('You need to be signed in to send messages');
      return;
    }
    
    try {
      setIsSending(true);
      
      // Determine if the current user is an employee or client
      const currentUserRole = employeeName ? 'employee' : 'client';
      
      const messageData = {
        orderId,
        senderId: user.uid,
        senderName: employeeName || user.displayName || user.email?.split('@')[0] || 'User',
        senderRole: currentUserRole,
        message: messageInput.trim(),
        isRead: false
      };
      
      // Add message to UI immediately for perceived performance
      const optimisticId = `temp-${Date.now()}`;
      const optimisticMessage: OrderMessage = {
        id: optimisticId,
        ...messageData,
        timestamp: new Date().toISOString(),
        isRead: false
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      
      // Clear input and attachment preview
      setMessageInput('');
      if (attachmentPreview) {
        URL.revokeObjectURL(attachmentPreview);
        setAttachmentPreview(null);
      }
      
      // Send to server
      let messageId;
      if (attachmentFile) {
        messageId = await sendOrderMessageWithAttachment(messageData, attachmentFile);
        setAttachmentFile(null);
      } else {
        messageId = await sendOrderMessage(messageData);
      }
      
      // Update messages with the actual message to replace the optimistic one
      const updatedMessages = await getOrderMessages(orderId);
      setMessages(updatedMessages);
      
      // Scroll to bottom within the chat component only
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'end',
          inline: 'nearest'
        });
      }
      
      // Simulate typing response after a delay (30% chance) - but only for client messages
      if (currentUserRole === 'client' && Math.random() > 0.7) {
        setTimeout(() => {
          setIsTyping(true);
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
          }, 3000);
        }, 1000);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message. Please try again.');
      
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(msg => !msg.id?.startsWith('temp-')));
    } finally {
      setIsSending(false);
    }
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
      
      // Generate preview for images
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        setAttachmentPreview(preview);
      } else {
        setAttachmentPreview(null);
      }
      
      toast.success(`File "${file.name}" attached`);
    }
  };
  
  const handleRemoveAttachment = () => {
    if (attachmentPreview) {
      URL.revokeObjectURL(attachmentPreview);
      setAttachmentPreview(null);
    }
    setAttachmentFile(null);
  };
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };
  
  const formatTimestamp = (timestamp: string | Date) => {
    try {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (err) {
      return '';
    }
  };
  
  const formatExactTime = (timestamp: string | Date) => {
    try {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      return format(date, 'h:mm a, MMM d');
    } catch (err) {
      return '';
    }
  };
  
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };
  
  const getMessageAvatar = (message: OrderMessage) => {
    // For client messages
    if (message.senderRole === 'client') {
      return (
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.photoURL || ''} alt={message.senderName} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {message.senderName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      );
    }
    
    // For employee/admin messages
    return (
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-blue-600 text-white">
          {message.senderName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    );
  };
  
  const isOrderActive = orderStatus !== 'cancelled' && orderStatus !== 'completed';
  
  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: OrderMessage[] }[] = [];
    
    messages.forEach((message) => {
      const messageDate = new Date(message.timestamp);
      const dateString = messageDate.toDateString();
      
      const existingGroup = groups.find(group => group.date === dateString);
      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({ date: dateString, messages: [message] });
      }
    });
    
    return groups;
  }, [messages]);
  
  // Get date display text
  const getDateDisplay = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return format(date, 'EEEE, MMMM d');
    }
  };
  
  return (
    <div className="flex flex-col h-full rounded-lg border overflow-hidden bg-card shadow-sm">
      <div className="px-4 py-3 border-b flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Order Communication</h3>
          <Badge variant={isOrderActive ? "default" : "secondary"} className="capitalize">
            {isOrderActive ? 'Active' : orderStatus.toLowerCase()}
          </Badge>
        </div>
        {employeeName && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-blue-600 text-white">
                      {employeeName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Assigned to: {employeeName}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      {/* Messages area */}
      <ScrollArea 
        className="flex-1 overflow-hidden" 
        onScrollCapture={handleScroll}
        ref={scrollAreaRef}
        type="always"
        scrollHideDelay={100}
      >
        <div className="p-4">
          {/* Error with retry button */}
          {error && (
            <div className="my-4 p-3 rounded-md bg-destructive/10 text-destructive flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleRetry} className="mt-1">
                <RefreshCw className="h-3 w-3 mr-2" />
                Retry
              </Button>
            </div>
          )}
          
          {/* Loading state */}
          {isLoading ? (
            <div className="space-y-5">
              {[1, 2, 3].map(i => (
                <div key={i} className={`flex gap-2 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2 max-w-[80%]">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className={`h-16 rounded-lg ${i % 2 === 0 ? 'w-32' : 'w-56'}`} />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="h-52 flex flex-col items-center justify-center text-center p-4">
              <Clock className="h-12 w-12 text-muted-foreground mb-2" />
              <h3 className="font-medium text-lg">No messages yet</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Start the conversation by sending a message to discuss details about your order
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedMessages.map((group, groupIndex) => (
                <div key={group.date} className="space-y-4">
                  {/* Date header */}
                  <div className="relative flex items-center my-6">
                    <div className="flex-grow border-t border-muted"></div>
                    <span className="flex-shrink mx-4 text-xs font-medium text-muted-foreground">
                      {getDateDisplay(group.date)}
                    </span>
                    <div className="flex-grow border-t border-muted"></div>
                  </div>
                  
                  {/* Messages for this date */}
                  {group.messages.map((message, messageIndex) => {
                    const isUserMessage = message.senderId === user?.uid;
                    const isOptimistic = message.id?.startsWith('temp-');
                    const showAvatar = messageIndex === 0 || 
                      group.messages[messageIndex - 1]?.senderId !== message.senderId;
                    
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex gap-2 ${isUserMessage ? 'flex-row-reverse' : ''}`}
                      >
                        {showAvatar ? (
                          getMessageAvatar(message)
                        ) : (
                          <div className="w-8" /> /* Spacer for alignment */
                        )}
                        
                        <div className={`flex flex-col max-w-[80%] ${isUserMessage ? 'items-end' : 'items-start'}`}>
                          {showAvatar && (
                            <div className={`flex items-center gap-2 mb-1 ${isUserMessage ? 'flex-row-reverse' : ''}`}>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-xs font-medium">{message.senderName}</span>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom">
                                    <p>{formatExactTime(message.timestamp)}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          )}
                          
                          <div 
                            className={`rounded-lg p-3 ${
                              isUserMessage 
                                ? 'bg-primary text-primary-foreground rounded-tr-none' 
                                : 'bg-muted rounded-tl-none'
                            } ${isOptimistic ? 'opacity-70' : ''}`}
                          >
                            {message.message && (
                              <p className="whitespace-pre-wrap">{message.message}</p>
                            )}
                            
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {message.attachments.map((attachment, i) => (
                                  <div key={i}>
                                    {attachment.type.startsWith('image/') ? (
                                      <div className="mt-2">
                                        <a
                                          href={attachment.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <img 
                                            src={attachment.url} 
                                            alt={attachment.name}
                                            className="rounded-md max-h-48 object-contain"
                                          />
                                        </a>
                                        <div className="flex justify-between items-center mt-1 text-xs">
                                          <span className="truncate max-w-[200px]">{attachment.name}</span>
                                          <a
                                            href={attachment.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-2"
                                            download
                                          >
                                            <Download className="h-3 w-3" />
                                          </a>
                                        </div>
                                      </div>
                                    ) : (
                                      <a
                                        href={attachment.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-2 p-2 rounded ${
                                          isUserMessage 
                                            ? 'bg-primary/50 hover:bg-primary/70' 
                                            : 'bg-background hover:bg-accent'
                                        } transition-colors`}
                                      >
                                        {getFileIcon(attachment.type)}
                                        <span className="text-sm truncate max-w-[200px]">{attachment.name}</span>
                                        <Download className="h-3 w-3" />
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {isUserMessage && (
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-[10px] text-muted-foreground">
                                {formatTimestamp(message.timestamp)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {isOptimistic ? (
                                  <Clock className="h-2.5 w-2.5" />
                                ) : message.isRead ? (
                                  <CheckCheck className="h-2.5 w-2.5 text-green-500" /> 
                                ) : (
                                  <Check className="h-2.5 w-2.5" />
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-end gap-2 mt-2"
                >
                  {employeeName ? (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-600 text-white">
                        {employeeName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-600 text-white">
                        S
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className="bg-muted p-3 rounded-lg rounded-tl-none flex items-center">
                    <div className="flex space-x-1">
                      <motion.div
                        className="w-2 h-2 bg-primary/50 rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-primary/50 rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-primary/50 rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} className="h-1" />
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Input area */}
      <AnimatePresence>
        {attachmentFile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-2 px-4 border-t"
          >
            <div className="flex items-center justify-between bg-muted p-2 rounded-md">
              <div className="flex items-center gap-2">
                {attachmentPreview ? (
                  <div className="relative h-10 w-10">
                    <img
                      src={attachmentPreview}
                      alt="Preview"
                      className="h-full w-full object-cover rounded-sm"
                    />
                  </div>
                ) : (
                  attachmentFile.type.startsWith('image/') ? (
                    <FileImage className="h-5 w-5" />
                  ) : (
                    <File className="h-5 w-5" />
                  )
                )}
                <div>
                  <div className="text-sm font-medium truncate max-w-[200px]">
                    {attachmentFile.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(attachmentFile.size / 1024).toFixed(0)} KB
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveAttachment}
                className="h-7 w-7"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Textarea
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder={isOrderActive ? "Type your message here..." : "This order is closed"}
            className="resize-none min-h-[60px] bg-muted/30"
            disabled={!isOrderActive || isSending}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          
          <div className="flex flex-col gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleAttachFile}
                    disabled={!isOrderActive || isSending}
                    className="h-9 w-9"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Attach a file</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={(!messageInput.trim() && !attachmentFile) || !isOrderActive || isSending}
                    className="h-9 w-9"
                  >
                    {isSending ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      >
                        <Clock className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Send message</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
        />
        
        {!isOrderActive && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            This order is {orderStatus.toLowerCase()}. You cannot send new messages.
          </p>
        )}
      </div>
    </div>
  );
} 