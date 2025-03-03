import type { Order, User } from '@/types';

const baseStyle = `
  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .header { background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
  .content { background: #fff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
  .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  .button { display: inline-block; padding: 12px 24px; background: #1e40af; color: white; text-decoration: none; border-radius: 6px; }
  .status { display: inline-block; padding: 6px 12px; border-radius: 4px; font-weight: bold; }
  .details { background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0; }
  .divider { border-top: 1px solid #e5e7eb; margin: 20px 0; }
`;

function getStatusStyle(status: string): string {
  const styles: Record<string, string> = {
    pending: 'background: #fef3c7; color: #92400e;',
    'in-progress': 'background: #dbeafe; color: #1e40af;',
    completed: 'background: #dcfce7; color: #166534;',
    cancelled: 'background: #fee2e2; color: #991b1b;',
    'on-hold': 'background: #f3f4f6; color: #4b5563;',
  };
  return styles[status] || styles.pending;
}

function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    pending: 'Pending',
    'in-progress': 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    'on-hold': 'On Hold',
  };
  return texts[status] || status;
}

export function generateOrderStatusEmail(order: Order, user: User, message?: string) {
  return `
    <html>
      <head>
        <style>${baseStyle}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Status Update</h1>
          </div>
          <div class="content">
            <p>Dear ${user.name},</p>
            <p>Your order status has been updated.</p>
            
            <div class="details">
              <h3>Order Details</h3>
              <p><strong>Order ID:</strong> #${order.id}</p>
              <p><strong>Status:</strong> <span class="status" style="${getStatusStyle(order.status)}">${getStatusText(order.status)}</span></p>
              <p><strong>Amount:</strong> ${order.currency} ${order.amount}</p>
              ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
            </div>

            <div class="divider"></div>
            
            <p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/client/orders/${order.id}" class="button">
                View Order Details
              </a>
            </p>
          </div>
          <div class="footer">
            <p>This is an automated message from SKS Consulting. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function generateOrderCancellationEmail(order: Order, user: User, reason: string) {
  return `
    <html>
      <head>
        <style>${baseStyle}</style>
      </head>
      <body>
        <div class="container">
          <div class="header" style="background: #991b1b;">
            <h1>Order Cancellation Confirmation</h1>
          </div>
          <div class="content">
            <p>Dear ${user.name},</p>
            <p>Your order has been successfully cancelled.</p>
            
            <div class="details">
              <h3>Cancellation Details</h3>
              <p><strong>Order ID:</strong> #${order.id}</p>
              <p><strong>Reason:</strong> ${reason}</p>
              <p><strong>Amount:</strong> ${order.currency} ${order.amount}</p>
              <p><strong>Cancellation Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            <div class="divider"></div>
            
            <p>If you have any questions about this cancellation, please don't hesitate to contact our support team.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} SKS Consulting. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function generateAdminNotificationEmail(order: Order, user: User, type: 'cancellation' | 'status-update', details: string) {
  return `
    <html>
      <head>
        <style>${baseStyle}</style>
      </head>
      <body>
        <div class="container">
          <div class="header" style="background: ${type === 'cancellation' ? '#991b1b' : '#1e40af'};">
            <h1>Order ${type === 'cancellation' ? 'Cancellation' : 'Status Update'} Notification</h1>
          </div>
          <div class="content">
            <div class="details">
              <h3>Client Information</h3>
              <p><strong>Name:</strong> ${user.name}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Company:</strong> ${user.company || 'N/A'}</p>
            </div>

            <div class="divider"></div>

            <div class="details">
              <h3>Order Details</h3>
              <p><strong>Order ID:</strong> #${order.id}</p>
              <p><strong>Status:</strong> <span class="status" style="${getStatusStyle(order.status)}">${getStatusText(order.status)}</span></p>
              <p><strong>Amount:</strong> ${order.currency} ${order.amount}</p>
              <p><strong>Details:</strong> ${details}</p>
            </div>

            <div class="divider"></div>
            
            <p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders/${order.id}" class="button">
                View Order Details
              </a>
            </p>
          </div>
          <div class="footer">
            <p>Internal notification - SKS Consulting Admin System</p>
          </div>
        </div>
      </body>
    </html>
  `;
} 