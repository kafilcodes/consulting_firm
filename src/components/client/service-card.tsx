'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import type { Service } from '@/types';

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col rounded-lg bg-white shadow-lg overflow-hidden"
    >
      {service.image && (
        <div className="flex-shrink-0">
          <img
            className="h-48 w-full object-cover"
            src={service.image}
            alt={service.name}
          />
        </div>
      )}
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-600">
            {service.category.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </p>
          <div className="mt-2 block">
            <p className="text-xl font-semibold text-gray-900">{service.name}</p>
            <p className="mt-3 text-base text-gray-500">
              {service.shortDescription}
            </p>
          </div>
          <div className="mt-6 space-y-2">
            {service.features.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-center text-sm text-gray-500">
                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                {feature}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6">
          <div className="mb-4">
            <p className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: service.price.currency,
                maximumFractionDigits: 0,
              }).format(service.price.amount)}
              {service.price.billingType !== 'one-time' && (
                <span className="text-sm font-normal text-gray-500">
                  /{service.price.billingType}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <Link
              href={`/client/services/${service.id}`}
              className="inline-flex items-center rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Learn More
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <button
              onClick={() => {
                // Add to cart logic here
              }}
              className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-blue-600 shadow-sm ring-1 ring-inset ring-blue-300 hover:bg-blue-50"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 