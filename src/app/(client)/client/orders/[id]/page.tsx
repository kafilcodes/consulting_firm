'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { getOrder, getService } from '@/lib/firebase/services';
import type { Order, Service } from '@/types';
import { Loader2, ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, Ban } from 'lucide-react';
import { OrderDocuments } from '@/components/client/order-documents';
import { OrderTimeline } from '@/components/client/order-timeline';
import { OrderCancelModal } from '@/components/client/order-cancel-modal';
import { useAuth } from '@/contexts/auth-context';

interface OrderWithService extends Order {
  service: Service;
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    text: 'Pending',
  },
  processing: {
    icon: AlertCircle,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    text: 'Processing',
  },
  completed: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    text: 'Completed',
  },
  cancelled: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    text: 'Cancelled',
  },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderWithService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const fetchedOrder = await getOrder(params.id as string);
        if (!fetchedOrder) {
          toast.error('Order not found');
          router.push('/client/orders');
          return;
        }

        const service = await getService(fetchedOrder.serviceId);
        if (!service) {
          toast.error('Service not found');
          router.push('/client/orders');
          return;
        }

        setOrder({ ...fetchedOrder, service });
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrder();
  }, [params.id, router]);

  const refreshOrder = async () => {
    try {
      const fetchedOrder = await getOrder(params.id as string);
      if (!fetchedOrder) {
        toast.error('Order not found');
        router.push('/client/orders');
        return;
      }

      const service = await getService(fetchedOrder.serviceId);
      if (!service) {
        toast.error('Service not found');
        router.push('/client/orders');
        return;
      }

      setOrder({ ...fetchedOrder, service });
    } catch (error) {
      console.error('Error refreshing order:', error);
      toast.error('Failed to refresh order details');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!order) return null;

  const status = statusConfig[order.status as keyof typeof statusConfig];
  const StatusIcon = status.icon;

  const canCancel = order.status === 'pending' || order.status === 'processing';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Orders
        </button>
      </div>

      <div className="lg:flex lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Order #{order.id.slice(-6).toUpperCase()}
          </h2>
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <StatusIcon className="mr-1.5 h-5 w-5 flex-shrink-0" />
              Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>
          </div>
        </div>
        <div className="mt-5 flex lg:ml-4 lg:mt-0">
          {canCancel && (
            <span className="sm:ml-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                <Ban className="h-5 w-5 mr-2" />
                Cancel Order
              </button>
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Order Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order.id.slice(-6).toUpperCase()}
            </h1>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.bgColor} ${status.color}`}
            >
              <StatusIcon className="mr-2 h-5 w-5" />
              {status.text}
            </span>
          </div>
        </div>

        {/* Order Details */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Service Details
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900">
                  {order.service.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {order.service.description}
                </p>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Estimated Duration</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {order.service.estimatedDuration}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Payment Details
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="mt-1 text-lg font-medium text-gray-900">
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: order.currency,
                      }).format(order.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Status</p>
                    <p
                      className={`mt-1 font-medium ${
                        order.paymentStatus === 'paid'
                          ? 'text-green-600'
                          : order.paymentStatus === 'failed'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      {order.paymentStatus.charAt(0).toUpperCase() +
                        order.paymentStatus.slice(1)}
                    </p>
                  </div>
                  {order.paymentId && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Payment ID</p>
                      <p className="mt-1 font-mono text-sm text-gray-900">
                        {order.paymentId}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <OrderDocuments
            orderId={order.id}
            documents={order.documents || []}
            onDocumentUpdate={refreshOrder}
          />

          {/* Timeline */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Order Timeline
            </h2>
            <div className="flow-root">
              <ul role="list" className="-mb-8">
                {order.timeline.map((event, eventIdx) => (
                  <li key={event.id}>
                    <div className="relative pb-8">
                      {eventIdx !== order.timeline.length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span
                            className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              statusConfig[event.status as keyof typeof statusConfig]
                                .bgColor
                            }`}
                          >
                            {React.createElement(
                              statusConfig[event.status as keyof typeof statusConfig]
                                .icon,
                              {
                                className: `h-5 w-5 ${
                                  statusConfig[
                                    event.status as keyof typeof statusConfig
                                  ].color
                                }`,
                                'aria-hidden': 'true',
                              }
                            )}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              {event.message}{' '}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {new Intl.DateTimeFormat('en-US', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            }).format(
                              event.timestamp instanceof Date
                                ? event.timestamp
                                : new Date(event.timestamp)
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <OrderCancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        order={order}
        onOrderUpdate={refreshOrder}
      />
    </div>
  );
} 