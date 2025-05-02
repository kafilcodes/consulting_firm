'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageSquare, Send } from 'lucide-react';

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  subject: z.string().min(5, { message: 'Subject must be at least 5 characters.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function SupportPage() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.displayName || '',
      email: user?.email || '',
      subject: '',
      message: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast.error('Authentication required', {
        description: 'Please sign in to submit a support request.'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Add document to Firestore
      await addDoc(collection(db, 'feedback'), {
        userId: user.uid,
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      toast.success('Support request submitted', {
        description: 'We\'ve received your message and will get back to you soon.'
      });

      // Reset form
      form.reset({
        name: user?.displayName || '',
        email: user?.email || '',
        subject: '',
        message: '',
      });
    } catch (error) {
      console.error('Error submitting support request:', error);
      toast.error('Submission failed', {
        description: 'There was an error submitting your request. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle email contact button
  const handleEmailContact = () => {
    const subject = encodeURIComponent('Support Request from Client Portal');
    const body = encodeURIComponent(
      `Name: ${user?.displayName || form.getValues().name}\n` +
      `Email: ${user?.email || form.getValues().email}\n\n` +
      `Please describe your issue below:\n\n`
    );
    
    window.location.href = `mailto:support@sksconsulting.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Support & Help</h1>
      <p className="text-gray-600 mb-8">
        Get assistance with our services or contact our support team.
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Contact Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Submit a Support Request
            </CardTitle>
            <CardDescription>
              Fill out this form and we'll get back to you as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Your email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief subject of your request" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Please describe your issue or question in detail" 
                          className="min-h-[120px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Direct Contact & FAQs */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                Contact Directly
              </CardTitle>
              <CardDescription>
                Need urgent assistance? Contact our support team directly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Support Hours</h3>
                <p className="text-sm text-gray-600">Monday to Friday: 9 AM - 6 PM IST</p>
                <p className="text-sm text-gray-600">Saturday: 10 AM - 2 PM IST</p>
                <p className="text-sm text-gray-600">Sunday: Closed</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleEmailContact} 
                variant="outline" 
                className="w-full"
              >
                Email Support
                <Mail className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Quick answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { 
                  question: "How do I update my profile information?", 
                  answer: "You can update your profile by navigating to your Profile page from the dropdown menu in the top right corner."
                },
                { 
                  question: "How do I upload documents?", 
                  answer: "Go to the Documents section, click on 'Upload Documents' and follow the instructions to upload your files."
                },
                { 
                  question: "How long does it take to process an order?", 
                  answer: "Order processing times vary by service type. Standard orders are typically processed within 2-3 business days."
                },
              ].map((faq, index) => (
                <div key={index} className="pb-3">
                  <h3 className="text-sm font-medium mb-1">{faq.question}</h3>
                  <p className="text-sm text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button 
                variant="link" 
                onClick={() => router.push('/client/faq')}
                className="w-full"
              >
                View All FAQs
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 