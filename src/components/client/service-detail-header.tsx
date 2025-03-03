'use client';

import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import type { Service } from '@/types';

interface ServiceDetailHeaderProps {
  service: Service;
}

export function ServiceDetailHeader({ service }: ServiceDetailHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-16 pb-12"
    >
      <nav className="flex" aria-label="Breadcrumb">
        <ol role="list" className="flex items-center space-x-4">
          <li>
            <div>
              <a href="/client/services" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                Services
              </a>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <svg
                className="h-5 w-5 flex-shrink-0 text-gray-300"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
              </svg>
              <a
                href={`/client/services?category=${service.category}`}
                className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                {service.category.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </a>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <svg
                className="h-5 w-5 flex-shrink-0 text-gray-300"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
              </svg>
              <span
                className="ml-4 text-sm font-medium text-gray-500"
                aria-current="page"
              >
                {service.name}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="mt-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          {service.name}
        </h1>
        <p className="mt-4 max-w-2xl text-xl text-gray-500">
          {service.description}
        </p>
      </div>

      <div className="mt-8 flex items-center space-x-6">
        <div className="flex items-center">
          <Clock className="h-5 w-5 text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">
            Estimated Duration: {service.estimatedDuration}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          Starting from{' '}
          <span className="font-semibold text-gray-900">
            {new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: service.price.currency,
              maximumFractionDigits: 0,
            }).format(service.price.amount)}
          </span>
          {service.price.billingType !== 'one-time' && (
            <span>/{service.price.billingType}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
} 