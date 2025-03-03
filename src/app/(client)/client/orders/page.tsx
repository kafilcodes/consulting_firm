'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getClientOrders, getService } from '@/lib/firebase/services';
import type { Order, Service } from '@/types';
import { OrderCard } from '@/components/client/order-card';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface OrderWithService extends Order {
  service: Service;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderWithService[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;

      try {
        const fetchedOrders = await getClientOrders(user.id);
        
        // Fetch service details for each order
        const ordersWithServices = await Promise.all(
          fetchedOrders.map(async (order) => {
            const service = await getService(order.serviceId);
            return {
              ...order,
              service: service!,
            };
          })
        );

        setOrders(ordersWithServices);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            My Orders
          </h2>
        </div>
      </div>

      <div className="mt-8">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No orders</h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't placed any orders yet.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <OrderCard order={order} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 