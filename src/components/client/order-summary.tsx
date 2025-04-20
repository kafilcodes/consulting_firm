'use client';

import { motion } from 'framer-motion';

// Define our own types without relying on cart-store
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  currency?: string;
  description?: string;
}

interface OrderSummaryProps {
  items: OrderItem[];
  total: {
    subtotal: number;
    tax: number;
    total: number;
  };
}

export function OrderSummary({ items, total }: OrderSummaryProps) {
  return (
    <div className="bg-gray-50 rounded-lg px-4 py-6 sm:p-6 lg:p-8">
      <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>

      <div className="mt-6 space-y-4">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              <div>
                <h3 className="text-sm text-gray-700">{item.name}</h3>
                <p className="mt-1 text-sm text-gray-500">Quantity: {item.quantity}</p>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: item.currency || 'INR',
              }).format(item.price * item.quantity)}
            </p>
          </motion.div>
        ))}

        <div className="border-t border-gray-200 pt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium text-gray-900">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
              }).format(total.subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">GST (18%)</span>
            <span className="font-medium text-gray-900">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
              }).format(total.tax)}
            </span>
          </div>
          <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
            <span className="text-base font-medium text-gray-900">Total Amount</span>
            <span className="text-base font-medium text-gray-900">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
              }).format(total.total)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="rounded-md bg-gray-100 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-800">Payment Information</h3>
              <div className="mt-2 text-sm text-gray-600">
                <ul className="list-disc space-y-1 pl-5">
                  <li>All prices are inclusive of GST</li>
                  <li>Payment is processed securely through Razorpay</li>
                  <li>You will receive a confirmation email after successful payment</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 