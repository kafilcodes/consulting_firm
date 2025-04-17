'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/auth-context';
import { useCartStore } from '@/stores/cart-store';
import { createOrder, updateOrderPayment } from '@/lib/firebase/services';
import {
  loadRazorpayScript,
  initializeRazorpayCheckout,
  formatAmountForRazorpay,
  type PaymentOptions,
} from '@/lib/razorpay';

const checkoutSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
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
}

export function CheckoutForm({ orderId }: CheckoutFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { items, getTotal, clearCart } = useCartStore();
  const { total } = getTotal();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
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
        country: user?.address?.country || '',
      },
    },
  });

  const handleCheckout = async (data: CheckoutFormData) => {
    try {
      setIsLoading(true);

      // Load Razorpay script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Create order in Firebase
      const orderId = await createOrder({
        clientId: user!.id,
        serviceId: items[0].service.id, // For now, handling single service
        status: 'pending',
        amount: total,
        currency: 'INR',
        paymentStatus: 'pending',
        documents: [],
        timeline: [
          {
            id: crypto.randomUUID(),
            status: 'pending',
            message: 'Order created',
            timestamp: new Date(),
            updatedBy: user!.id,
          },
        ],
      });

      // Initialize Razorpay payment
      const paymentOptions: PaymentOptions = {
        amount: formatAmountForRazorpay(total),
        currency: 'INR',
        orderId,
        name: 'SKS Consulting',
        description: `Payment for ${items.map(item => item.name).join(', ')}`,
        image: '/logo.png',
        prefill: {
          name: data.name,
          email: data.email,
          contact: data.phone,
        },
        notes: {
          address: `${data.address.street}, ${data.address.city}, ${data.address.state}, ${data.address.postalCode}, ${data.address.country}`,
        },
      };

      // Process payment
      const response = await initializeRazorpayCheckout(paymentOptions);
      
      // Handle successful payment
      if (response.razorpay_payment_id) {
        // Update order payment status
        await updateOrderPayment(orderId, {
          paymentId: response.razorpay_payment_id,
          paymentStatus: 'paid',
          paymentResponse: response,
        });

        clearCart();
        toast.success('Payment successful! Redirecting to orders...');
        router.push('/client/orders');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleCheckout)} className="space-y-8">
      {/* Contact Information */}
      <div>
        <h2 className="text-lg font-medium text-gray-900">Contact Information</h2>
        <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              {...register('name')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              {...register('email')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              {...register('phone')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Billing Address */}
      <div>
        <h2 className="text-lg font-medium text-gray-900">Billing Address</h2>
        <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
          <div className="sm:col-span-2">
            <label htmlFor="street" className="block text-sm font-medium text-gray-700">
              Street Address
            </label>
            <input
              type="text"
              id="street"
              {...register('address.street')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            {errors.address?.street && (
              <p className="mt-1 text-sm text-red-600">
                {errors.address.street.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              type="text"
              id="city"
              {...register('address.city')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            {errors.address?.city && (
              <p className="mt-1 text-sm text-red-600">
                {errors.address.city.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              State
            </label>
            <input
              type="text"
              id="state"
              {...register('address.state')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            {errors.address?.state && (
              <p className="mt-1 text-sm text-red-600">
                {errors.address.state.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
              Postal Code
            </label>
            <input
              type="text"
              id="postalCode"
              {...register('address.postalCode')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            {errors.address?.postalCode && (
              <p className="mt-1 text-sm text-red-600">
                {errors.address.postalCode.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <input
              type="text"
              id="country"
              {...register('address.country')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            {errors.address?.country && (
              <p className="mt-1 text-sm text-red-600">
                {errors.address.country.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-blue-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-blue-500 ${
            isLoading ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </div>
          ) : (
            'Pay Now'
          )}
        </button>
      </div>
    </form>
  );
} 