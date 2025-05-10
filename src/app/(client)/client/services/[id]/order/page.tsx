'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, CheckCircle, AlertCircle, FileText, LogIn } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/utils';
import { getServiceById } from '@/lib/data/services-data';
import { createOrder } from '@/lib/firebase/services';
import { useAuth } from '@/contexts/auth-context';
import { createRazorpayOrder, generateRazorpayOptions } from '@/lib/razorpay';

// Declare Razorpay as a global type
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function ServiceOrderPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, getIdToken, loading: authLoading } = useAuth();
  
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  
  const serviceId = id as string;

  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please sign in to access the order page');
      const redirectUrl = `/auth/sign-in?callbackUrl=${encodeURIComponent(`/client/services/${serviceId}/order`)}`;
      router.push(redirectUrl);
    }
  }, [user, authLoading, router, serviceId]);

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpayScript = async () => {
      return new Promise<boolean>((resolve) => {
        if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
          setRazorpayLoaded(true);
          resolve(true);
          return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        
        script.onload = () => {
          setRazorpayLoaded(true);
          resolve(true);
        };
        
        script.onerror = () => {
          console.error('Failed to load Razorpay SDK');
          toast.error('Payment gateway failed to load. Please try again later.');
          resolve(false);
        };
        
        document.body.appendChild(script);
      });
    };
    
    loadRazorpayScript();
  }, []);

  // Fetch service details
  useEffect(() => {
    const fetchServiceDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get service details from mock data
        const serviceData = getServiceById(serviceId);
        
        if (!serviceData) {
          throw new Error('Service not found');
        }
        
        setService(serviceData);
      } catch (error) {
        console.error('Error fetching service details:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
        toast.error(error instanceof Error ? error.message : 'Failed to load service details');
        
        // Redirect back to services page after a delay
        setTimeout(() => {
          router.push('/client/services');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };
    
    fetchServiceDetails();
  }, [serviceId, router]);

  // Handle payment process
  const handlePayment = async () => {
    if (!user) {
      toast.error('Please sign in to continue');
      const redirectUrl = `/auth/sign-in?callbackUrl=${encodeURIComponent(`/client/services/${serviceId}/order`)}`;
      router.push(redirectUrl);
      return;
    }
    
    if (!razorpayLoaded) {
      toast.error('Payment gateway is still loading. Please try again.');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Get authentication token
      const token = await getIdToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Step 1: Create Razorpay order first (without creating a Firestore order)
      console.log('Creating Razorpay order...');
      console.log('Service details:', {
        id: service.id,
        name: service.name,
        amount: service.price.amount,
        currency: service.price.currency
      });
      
      // Generate a short ID for the receipt
      const tempOrderId = Math.random().toString(36).substring(2, 10);
      
      // Create Razorpay order using our utility function
      const razorpayData = await createRazorpayOrder(
        service.price.amount,
        service.price.currency,
        tempOrderId,
        token
      );
      
      console.log('Razorpay order created successfully:', {
        id: razorpayData.id,
        amount: razorpayData.amount,
        currency: razorpayData.currency
      });
      
      if (!razorpayData.id || !razorpayData.key_id) {
        console.error('Invalid Razorpay response:', razorpayData);
        throw new Error('Invalid response from payment gateway');
      }
      
      // Step 2: Initialize Razorpay checkout
      const options = generateRazorpayOptions(
        razorpayData.id,
        razorpayData.amount,
        razorpayData.currency,
        razorpayData.key_id,
        user,
        service.name
      );
      
      // Add handler and modal options
      options.handler = async function(response: any) {
        try {
          console.log('Payment successful, response from Razorpay:', {
            payment_id: response.razorpay_payment_id,
            order_id: response.razorpay_order_id,
            signature: response.razorpay_signature ? 'Present' : 'Missing'
          });
          
          // Step 3: After successful payment, create order in Firestore and verify payment
          console.log('Creating order in Firestore...');
          const orderData = {
            serviceId: service.id,
            serviceName: service.name,
            amount: service.price.amount,
            currency: service.price.currency,
            status: 'pending',
            userId: user.uid,
            userEmail: user.email,
            userName: user.displayName || user.email?.split('@')[0] || 'User',
            paymentStatus: 'completed', // Payment is already completed at this point
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            billingCycle: service.price.billingCycle || null,
            serviceType: service.serviceType,
            timeline: [
              {
                status: 'created',
                timestamp: new Date().toISOString(),
                message: 'Order created'
              },
              {
                status: 'payment_completed',
                timestamp: new Date().toISOString(),
                message: 'Payment completed'
              }
            ],
            createdAt: new Date().toISOString()
          };
          
          // Create the order in Firestore
          const orderId = await createOrder(orderData);
          
          // Show success message and redirect to orders page
          toast.success('Payment successful! Your order has been placed.');
          router.push('/client/orders');
        } catch (error) {
          console.error('Error creating order after payment:', error);
          setError(error instanceof Error ? error.message : 'Failed to create order after payment');
          toast.error('Payment was successful, but we had trouble creating your order. Please contact support.');
          setIsProcessing(false);
        }
      };
      
      options.modal = {
        ondismiss: function() {
          setIsProcessing(false);
          toast.info('Payment cancelled');
        }
      };
      
      // Initialize Razorpay
      const razorpay = new window.Razorpay(options);
      
      // Handle payment failure
      razorpay.on('payment.failed', function(failureResponse: any) {
        console.error('Payment failed:', failureResponse);
        
        let errorMessage = 'Payment failed';
        if (failureResponse.error) {
          errorMessage = failureResponse.error.description || errorMessage;
          console.error('Error details:', failureResponse.error);
        }
        
        setError(`Payment failed: ${errorMessage}`);
        toast.error(`Payment failed: ${errorMessage}`);
        setIsProcessing(false);
      });
      
      // Open Razorpay checkout modal
      razorpay.open();
    } catch (error) {
      console.error('Error processing payment:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      toast.error(error instanceof Error ? error.message : 'Failed to process payment');
      setIsProcessing(false);
    }
  };

  // If user is not authenticated, show sign-in prompt
  if (!authLoading && !user) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto text-center">
          <LogIn className="h-16 w-16 mx-auto text-primary mb-6" />
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-muted-foreground mb-8">
            Please sign in to your account to place an order for this service.
          </p>
          <Button 
            size="lg" 
            className="w-full"
            asChild
          >
            <Link href={`/auth/sign-in?callbackUrl=${encodeURIComponent(`/client/services/${serviceId}/order`)}`}>
              Sign In to Continue
            </Link>
          </Button>
          <Button 
            variant="outline" 
            className="w-full mt-4"
            asChild
          >
            <Link href={`/client/services/${serviceId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Service Details
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Loading skeleton UI
  if (loading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex items-center gap-2">
            <Skeleton className="h-10 w-28" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Skeleton className="h-8 w-64 mb-4" />
              <Skeleton className="h-32 w-full rounded-lg mb-6" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-6 w-3/4 mb-6" />
              
              <Skeleton className="h-8 w-48 mb-4" />
              <div className="space-y-2 mb-6">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            </div>
            
            <div className="md:col-span-1">
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{error || 'Service not found'}</AlertTitle>
          <AlertDescription>
            {error === 'Service not found' 
              ? "We couldn't find the service you're looking for. It may have been removed or the URL may be incorrect."
              : "An error occurred while loading the service. Please try again later."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Back button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-6"
          asChild
        >
          <Link href={`/client/services/${service.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to service details
          </Link>
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Service details */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{service.name}</h1>
              <p className="text-muted-foreground">{service.description}</p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-2">Service Details</h2>
              <div className="space-y-2">
                {service.features && service.features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Test Card Information */}
            {process.env.NODE_ENV !== 'production' && (
              <div className="bg-muted p-4 rounded-lg border border-dashed">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Test Card Information
                </h3>
                <div className="text-xs space-y-1 text-muted-foreground">
                  <p>Card Number: <span className="font-mono">4111 1111 1111 1111</span></p>
                  <p>Expiry: Any future date (MM/YY)</p>
                  <p>CVV: Any 3 digits</p>
                  <p>Name: Any name</p>
                  <p>OTP: Any 6 digits for success, less than 4 digits for failure</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Order summary */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Service Fee</span>
                  <span>{formatCurrency(service.price.amount, service.price.currency)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>GST (18%)</span>
                  <span>{formatCurrency(service.price.amount * 0.18, service.price.currency)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(service.price.amount * 1.18, service.price.currency)}</span>
                </div>
                {service.price.billingCycle && (
                  <div className="text-xs text-muted-foreground text-center">
                    {service.price.billingCycle === 'monthly' ? 'Monthly subscription' : 
                     service.price.billingCycle === 'yearly' ? 'Annual subscription' : 
                     'One-time payment'}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Proceed to Payment'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}