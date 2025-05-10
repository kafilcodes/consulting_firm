'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { loadRazorpayScript } from '@/lib/razorpay';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

const checkoutSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
  }),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  orderId?: string | null;
  serviceId?: string | null;
  service?: any;
  total?: {
    subtotal: number;
    tax: number;
    total: number;
  };
}

export function CheckoutForm({ orderId, serviceId, service, total }: CheckoutFormProps) {
  const router = useRouter();
  const { user, getIdToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success' | 'error'>('form');
  
  // Calculate totals based on the service if not provided
  const calculatedTotal = total || {
    subtotal: service?.price || 0,
    tax: (service?.price || 0) * 0.18, // 18% GST
    total: (service?.price || 0) * 1.18, // Price + 18% GST
  };

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: {
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        postalCode: user?.address?.postalCode || '',
        country: user?.address?.country || 'India',
      },
    },
  });

  const handleCheckout = async (data: CheckoutFormData) => {
    try {
      if (!service && !serviceId) {
        toast.error('No service selected for checkout');
        return;
      }
      
      setIsLoading(true);
      setPaymentStep('processing');

      // Fetch service details if not provided
      let serviceDetails = service;
      if (!serviceDetails && serviceId) {
        // In a real app, fetch from API
        serviceDetails = { id: serviceId, name: 'Service' };
      }

      // Load Razorpay script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Get authentication token
      const token = await getIdToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // 1. Create order in our system
      const createOrderResponse = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          clientId: user!.id,
          serviceId: serviceDetails.id,
          amount: calculatedTotal.total,
          currency: 'INR',
          clientDetails: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address
          }
        }),
      });

      const orderResult = await createOrderResponse.json();
      if (!createOrderResponse.ok) {
        throw new Error(orderResult.error || 'Failed to create order');
      }

      const { orderId } = orderResult;

      // 2. Create Razorpay order
      const razorpayOrderResponse = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: calculatedTotal.total,
          currency: 'INR',
          receipt: orderId,
          notes: {
            serviceId: serviceDetails.id,
            serviceName: serviceDetails.name,
          }
        }),
      });

      const razorpayOrder = await razorpayOrderResponse.json();
      if (!razorpayOrderResponse.ok) {
        throw new Error(razorpayOrder.error || 'Failed to create Razorpay order');
      }

      // 3. Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_yourkeyhere',
        amount: razorpayOrder.amount * 100, // in paisa
        currency: razorpayOrder.currency,
        name: 'SKS Consulting',
        description: `Payment for ${serviceDetails.name}`,
        order_id: razorpayOrder.id,
        prefill: {
          name: data.name,
          email: data.email,
          contact: data.phone,
        },
        notes: {
          address: `${data.address.street}, ${data.address.city}, ${data.address.state}, ${data.address.postalCode}, ${data.address.country}`,
        },
        theme: {
          color: '#3182ce',
        },
        handler: async function (response: any) {
          try {
            // 4. Verify payment
            const verifyResponse = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderId,
              }),
            });

            const verifyResult = await verifyResponse.json();
            if (!verifyResponse.ok) {
              throw new Error(verifyResult.error || 'Payment verification failed');
            }

            // Payment successful
            setPaymentStep('success');
            toast.success('Payment successful! Redirecting to orders...');
            
            // Redirect to orders page
            setTimeout(() => {
              router.push('/client/orders');
            }, 2000);
          } catch (error) {
            console.error('Payment verification error:', error);
            setPaymentStep('error');
            toast.error('Payment verification failed. Please contact support.');
          }
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      
      // Handle payment failure
      razorpay.on('payment.failed', function (response: any) {
        setPaymentStep('error');
        toast.error(`Payment failed: ${response.error.description}`);
      });

      razorpay.open();
    } catch (error) {
      console.error('Checkout error:', error);
      setPaymentStep('error');
      toast.error(error instanceof Error ? error.message : 'Failed to process payment');
    } finally {
      setIsLoading(false);
    }
  };

  // Show appropriate UI based on payment step
  if (paymentStep === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mb-4"></div>
        <h3 className="text-xl font-medium mb-2">Processing Payment</h3>
        <p className="text-muted-foreground text-center">
          Please wait while we process your payment...
        </p>
      </div>
    );
  }

  if (paymentStep === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-green-100 rounded-full p-4 mb-4">
          <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 className="text-xl font-medium mb-2">Payment Successful!</h3>
        <p className="text-muted-foreground text-center mb-6">
          Your order has been placed successfully. Redirecting to your orders...
        </p>
        <Button onClick={() => router.push('/client/orders')}>
          View My Orders
        </Button>
      </div>
    );
  }

  if (paymentStep === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-red-100 rounded-full p-4 mb-4">
          <svg className="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <h3 className="text-xl font-medium mb-2">Payment Failed</h3>
        <p className="text-muted-foreground text-center mb-6">
          There was an issue processing your payment. Please try again or contact support.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setPaymentStep('form')}>
            Try Again
          </Button>
          <Button onClick={() => router.push('/client/support')}>
            Contact Support
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleCheckout)} className="space-y-8">
        {/* Contact Information */}
        <div>
          <h2 className="text-lg font-medium mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
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
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+91 9876543210" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Billing Address */}
        <div>
          <h2 className="text-lg font-medium mb-4">Billing Address</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="address.street"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Mumbai" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input placeholder="Maharashtra" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input placeholder="400001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="India" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ₹${calculatedTotal.total.toFixed(2)}`
          )}
        </Button>

        <p className="text-sm text-muted-foreground text-center mt-4">
          By clicking "Pay", you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>
    </Form>
  );
} 