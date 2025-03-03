'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Clock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useCartStore } from '@/stores/cart-store';
import type { Service } from '@/types';

interface ServicePricingProps {
  service: Service;
}

export function ServicePricing({ service }: ServicePricingProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      addItem(service);
      toast.success('Service added to cart');
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay for UX
    } catch (error) {
      toast.error('Failed to add service to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderNow = async () => {
    setIsOrdering(true);
    try {
      addItem(service);
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay for UX
      router.push('/client/cart');
    } catch (error) {
      toast.error('Failed to process order');
      setIsOrdering(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5"
    >
      <div className="p-6">
        <h3 className="text-lg font-semibold leading-6 text-gray-900">
          Service Package
        </h3>

        <div className="mt-4">
          <p className="text-3xl font-bold tracking-tight text-gray-900">
            {new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: service.price.currency,
              maximumFractionDigits: 0,
            }).format(service.price.amount)}
            {service.price.billingType !== 'one-time' && (
              <span className="text-base font-normal text-gray-500">
                /{service.price.billingType}
              </span>
            )}
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">
              Estimated Duration: {service.estimatedDuration}
            </span>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleAddToCart}
            disabled={isLoading}
            className={`w-full rounded-md bg-blue-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
              isLoading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
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
                Adding to Cart...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </span>
            )}
          </button>
          <button
            onClick={handleOrderNow}
            disabled={isOrdering}
            className="mt-3 w-full rounded-md bg-white px-3.5 py-2.5 text-center text-sm font-semibold text-blue-600 shadow-sm ring-1 ring-inset ring-blue-300 hover:bg-blue-50"
          >
            {isOrdering ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600"
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
              </span>
            ) : (
              <>
                Order Now
                <ArrowRight className="ml-2 h-4 w-4 inline" />
              </>
            )}
          </button>
        </div>

        <div className="mt-6 text-center">
          <a
            href="#"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Need a custom quote?
          </a>
        </div>
      </div>

      <div className="border-t border-gray-900/5 px-6 py-4">
        <h4 className="text-sm font-medium text-gray-900">What's included:</h4>
        <ul role="list" className="mt-4 space-y-3">
          {service.features.slice(0, 4).map((feature, index) => (
            <li key={index} className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="ml-3 text-sm text-gray-500">{feature}</p>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
} 