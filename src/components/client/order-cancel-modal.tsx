'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { updateOrderStatus } from '@/lib/firebase/services';
import { useAuth } from '@/contexts/auth-context';
import type { Order } from '@/types';

const CANCELLATION_REASONS = [
  'Change in business requirements',
  'Service no longer needed',
  'Found alternative solution',
  'Budget constraints',
  'Timeline issues',
  'Not satisfied with communication',
  'Other',
] as const;

interface OrderCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onOrderUpdate: () => void;
}

export function OrderCancelModal({
  isOpen,
  onClose,
  order,
  onOrderUpdate,
}: OrderCancelModalProps) {
  const { user } = useAuth();
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [otherReason, setOtherReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const reason = selectedReason === 'Other' ? otherReason : selectedReason;
    if (!reason) {
      toast.error('Please select a reason for cancellation');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Processing cancellation...');

    try {
      // Update order status
      await updateOrderStatus(
        order.id,
        'cancelled',
        `Order cancelled by client. Reason: ${reason}`,
        user.id
      );

      // Send cancellation emails
      await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'order-cancellation',
          order,
          user,
          reason,
        }),
      });

      toast.success('Order cancelled successfully', { id: toastId });
      onOrderUpdate();
      handleClose();
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason('');
    setOtherReason('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-md"
          >
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-center text-gray-900">
                Cancel Order
              </h3>
              <p className="mt-2 text-sm text-center text-gray-500">
                Are you sure you want to cancel this order? This action cannot be
                undone.
              </p>

              <form onSubmit={handleSubmit} className="mt-6">
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="reason"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Reason for cancellation
                    </label>
                    <select
                      id="reason"
                      value={selectedReason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      disabled={isSubmitting}
                    >
                      <option value="">Select a reason</option>
                      {CANCELLATION_REASONS.map((reason) => (
                        <option key={reason} value={reason}>
                          {reason}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedReason === 'Other' && (
                    <div>
                      <label
                        htmlFor="otherReason"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Please specify
                      </label>
                      <textarea
                        id="otherReason"
                        value={otherReason}
                        onChange={(e) => setOtherReason(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        rows={3}
                        disabled={isSubmitting}
                      />
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    disabled={isSubmitting}
                  >
                    Confirm Cancellation
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 