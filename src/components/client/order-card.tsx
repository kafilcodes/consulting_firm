'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, ChevronRight, AlertCircle, CheckCircle, XCircle, Package } from 'lucide-react';
import type { Order, Service } from '@/types';

interface OrderCardProps {
  order: Order & { service: Service | null };
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    text: 'Pending',
  },
  processing: {
    icon: AlertCircle,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    text: 'Processing',
  },
  'in-progress': {
    icon: AlertCircle,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    text: 'In Progress',
  },
  completed: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    text: 'Completed',
  },
  cancelled: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    text: 'Cancelled',
  },
  'on-hold': {
    icon: Clock,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    text: 'On Hold',
  },
};

export function OrderCard({ order }: OrderCardProps) {
  const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = status.icon;
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt!));

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`bg-white rounded-lg shadow-sm border ${status.borderColor} overflow-hidden`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}
            >
              <StatusIcon className="mr-1 h-4 w-4" />
              {status.text}
            </span>
            <span className="text-sm text-gray-500">{formattedDate}</span>
          </div>
          <div className="text-sm font-medium text-gray-900">
            Order #{order.id.slice(-6).toUpperCase()}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-medium text-gray-900">
            {order.service ? order.service.name : 'Service Unavailable'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {order.service 
              ? order.service.shortDescription 
              : `Service ID: ${order.serviceId} (Service details could not be loaded)`}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p className="mt-1 text-lg font-medium text-gray-900">
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: order.currency || 'INR',
                }).format(order.amount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Status</p>
              <p className={`mt-1 text-sm font-medium ${
                order.paymentStatus === 'paid' || order.paymentStatus === 'completed'
                  ? 'text-green-600'
                  : order.paymentStatus === 'failed'
                  ? 'text-red-600'
                  : 'text-yellow-600'
              }`}>
                {(order.paymentStatus || 'pending').charAt(0).toUpperCase() + (order.paymentStatus || 'pending').slice(1)}
              </p>
            </div>
          </div>

          <Link
            href={`/client/orders/${order.id}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View Details
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Timeline Preview */}
      {order.timeline && order.timeline.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center space-x-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-gray-500">
                Latest Update: {order.timeline[order.timeline.length - 1].message}
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
} 