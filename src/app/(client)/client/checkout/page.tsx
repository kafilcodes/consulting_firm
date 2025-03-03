'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCartStore } from '@/stores/cart-store';
import { CheckoutForm } from '@/components/client/checkout-form';
import { OrderSummary } from '@/components/client/order-summary';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const items = useCartStore((state) => state.items);
  const getTotal = useCartStore((state) => state.getTotal);

  if (!items.length && !orderId) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Your cart is empty</h2>
        <p className="mt-2 text-gray-500">Add some services to your cart to proceed with checkout.</p>
      </div>
    );
  }

  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start xl:gap-x-16">
      <div className="lg:col-span-7">
        <CheckoutForm orderId={orderId} />
      </div>
      <div className="mt-10 lg:mt-0 lg:col-span-5">
        <OrderSummary items={items} total={getTotal()} />
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-24 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Checkout
        </h1>
        <Suspense
          fallback={
            <div className="mt-12 lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start xl:gap-x-16">
              <div className="lg:col-span-7">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="mt-10 lg:mt-0 lg:col-span-5">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-24 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          }
        >
          <div className="mt-12">
            <CheckoutContent />
          </div>
        </Suspense>
      </div>
    </div>
  );
} 