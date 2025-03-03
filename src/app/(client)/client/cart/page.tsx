'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cart-store';
import { toast } from 'react-hot-toast';

function CartContent() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const getTotal = useCartStore((state) => state.getTotal);

  const handleQuantityChange = (serviceId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(serviceId);
    } else {
      updateQuantity(serviceId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    router.push('/client/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Your cart is empty</h2>
        <p className="mt-2 text-gray-500">Add some services to your cart to proceed with checkout.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flow-root">
        <ul role="list" className="-my-6 divide-y divide-gray-200">
          {items.map((item) => (
            <li key={item.service.id} className="flex py-6">
              {item.service.image && (
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                  <img
                    src={item.service.image}
                    alt={item.service.name}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
              )}
              <div className="ml-4 flex flex-1 flex-col">
                <div>
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <h3>{item.service.name}</h3>
                    <p className="ml-4">
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: item.service.price.currency,
                      }).format(item.service.price.amount * item.quantity)}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {item.service.shortDescription}
                  </p>
                </div>
                <div className="flex flex-1 items-end justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <label htmlFor={`quantity-${item.service.id}`} className="text-gray-500">
                      Qty
                    </label>
                    <select
                      id={`quantity-${item.service.id}`}
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(item.service.id, parseInt(e.target.value))
                      }
                      className="rounded-md border-gray-300 py-1.5 text-base leading-5 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    >
                      {[...Array(10)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.service.id)}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
        <div className="flex justify-between text-base font-medium text-gray-900">
          <p>Subtotal</p>
          <p>
            {new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
            }).format(getTotal().subtotal)}
          </p>
        </div>
        <div className="flex justify-between text-base font-medium text-gray-500 mt-2">
          <p>GST (18%)</p>
          <p>
            {new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
            }).format(getTotal().tax)}
          </p>
        </div>
        <div className="flex justify-between text-base font-medium text-gray-900 mt-4 pt-4 border-t border-gray-200">
          <p>Total</p>
          <p>
            {new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
            }).format(getTotal().total)}
          </p>
        </div>
        <div className="mt-6">
          <button
            onClick={handleCheckout}
            className="w-full rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Checkout
          </button>
        </div>
        <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
          <p>
            or{' '}
            <button
              type="button"
              onClick={() => router.push('/client/services')}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Continue Shopping
              <span aria-hidden="true"> &rarr;</span>
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-8">
        Shopping Cart
      </h1>
      <Suspense
        fallback={
          <div className="animate-pulse space-y-8">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        }
      >
        <CartContent />
      </Suspense>
    </div>
  );
} 