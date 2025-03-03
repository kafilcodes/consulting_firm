import nodemailer from 'nodemailer';
import type { Order, User } from '@/types';
import {
  generateOrderStatusEmail,
  generateOrderCancellationEmail,
  generateAdminNotificationEmail,
} from './templates';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface EmailTrackingInfo {
  messageId: string;
  timestamp: Date;
  recipient: string;
  type: 'status' | 'cancellation' | 'admin';
  orderId: string;
  status: 'sent' | 'failed';
  error?: string;
}

const emailHistory: EmailTrackingInfo[] = [];

async function sendEmailWithRetry(
  options: nodemailer.SendMailOptions,
  retries = 3,
  delay = 1000
): Promise<nodemailer.SentMessageInfo> {
  try {
    return await transporter.sendMail(options);
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return sendEmailWithRetry(options, retries - 1, delay * 2);
    }
    throw error;
  }
}

function trackEmail(info: EmailTrackingInfo) {
  emailHistory.push(info);
  // In a production environment, you would save this to a database
  console.log('Email tracking:', info);
}

export async function sendOrderStatusEmail(
  order: Order,
  user: User,
  message?: string
) {
  const html = generateOrderStatusEmail(order, user, message);
  
  try {
    const info = await sendEmailWithRetry({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Order Status Update - #${order.id}`,
      html,
    });

    // Send admin notification
    await sendEmailWithRetry({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `Order Status Changed - #${order.id}`,
      html: generateAdminNotificationEmail(order, user, 'status-update', message || ''),
    });

    // Track emails
    trackEmail({
      messageId: info.messageId,
      timestamp: new Date(),
      recipient: user.email,
      type: 'status',
      orderId: order.id,
      status: 'sent',
    });

    return info;
  } catch (error) {
    trackEmail({
      messageId: '',
      timestamp: new Date(),
      recipient: user.email,
      type: 'status',
      orderId: order.id,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

export async function sendOrderCancellationEmail(
  order: Order,
  user: User,
  reason: string
) {
  const html = generateOrderCancellationEmail(order, user, reason);
  
  try {
    const info = await sendEmailWithRetry({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Order Cancellation Confirmation - #${order.id}`,
      html,
    });

    // Send admin notification
    await sendEmailWithRetry({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `Order Cancelled - #${order.id}`,
      html: generateAdminNotificationEmail(order, user, 'cancellation', reason),
    });

    // Track emails
    trackEmail({
      messageId: info.messageId,
      timestamp: new Date(),
      recipient: user.email,
      type: 'cancellation',
      orderId: order.id,
      status: 'sent',
    });

    return info;
  } catch (error) {
    trackEmail({
      messageId: '',
      timestamp: new Date(),
      recipient: user.email,
      type: 'cancellation',
      orderId: order.id,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

// For development/testing purposes
export function getEmailHistory(): EmailTrackingInfo[] {
  return emailHistory;
}

// Verify email configuration
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
} 