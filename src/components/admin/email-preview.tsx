'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Order, User } from '@/types';
import {
  generateOrderStatusEmail,
  generateOrderCancellationEmail,
  generateAdminNotificationEmail,
} from '@/lib/email/templates';

interface EmailPreviewProps {
  order: Order;
  user: User;
}

type EmailType = 'status' | 'cancellation' | 'admin';

export function EmailPreview({ order, user }: EmailPreviewProps) {
  const [emailType, setEmailType] = useState<EmailType>('status');
  const [message, setMessage] = useState('');
  const [reason, setReason] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');

  const generatePreview = () => {
    let html = '';
    switch (emailType) {
      case 'status':
        html = generateOrderStatusEmail(order, user, message);
        break;
      case 'cancellation':
        html = generateOrderCancellationEmail(order, user, reason);
        break;
      case 'admin':
        html = generateAdminNotificationEmail(
          order,
          user,
          'status-update',
          message
        );
        break;
    }
    setPreviewHtml(html);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Email Template Preview</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Type
            </label>
            <select
              value={emailType}
              onChange={(e) => setEmailType(e.target.value as EmailType)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="status">Status Update</option>
              <option value="cancellation">Cancellation</option>
              <option value="admin">Admin Notification</option>
            </select>
          </div>

          {emailType === 'status' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status Message
              </label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter status update message"
              />
            </div>
          )}

          {emailType === 'cancellation' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cancellation Reason
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter cancellation reason"
              />
            </div>
          )}

          <button
            onClick={generatePreview}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Generate Preview
          </button>
        </div>
      </div>

      {previewHtml && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Preview</h3>
            <button
              onClick={() => {
                const win = window.open('', '_blank');
                win?.document.write(previewHtml);
                win?.document.close();
              }}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Open in New Tab
            </button>
          </div>
          <div className="border rounded-lg p-4">
            <iframe
              srcDoc={previewHtml}
              className="w-full h-[600px]"
              title="Email Preview"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
} 