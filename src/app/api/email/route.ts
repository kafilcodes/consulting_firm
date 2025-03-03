import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import type { Order, User } from '@/types';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    const { type, order, user, reason } = await request.json();
    const adminEmail = process.env.ADMIN_EMAIL;

    switch (type) {
      case 'order-cancellation':
        // Send email to client
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: `Order Cancellation Confirmation - #${order.id}`,
          html: `
            <h2>Order Cancellation Confirmation</h2>
            <p>Dear ${user.name},</p>
            <p>Your order #${order.id} has been successfully cancelled.</p>
            <p>Order Details:</p>
            <ul>
              <li>Order ID: ${order.id}</li>
              <li>Amount: ${order.currency} ${order.amount}</li>
              <li>Cancellation Date: ${new Date().toLocaleDateString()}</li>
              <li>Reason: ${reason}</li>
            </ul>
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p>Best regards,<br>SKS Consulting Team</p>
          `,
        });

        // Send notification to admin
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: adminEmail,
          subject: `Order Cancelled - #${order.id}`,
          html: `
            <h2>Order Cancellation Notification</h2>
            <p>Order #${order.id} has been cancelled by the client.</p>
            <p>Client Details:</p>
            <ul>
              <li>Name: ${user.name}</li>
              <li>Email: ${user.email}</li>
            </ul>
            <p>Order Details:</p>
            <ul>
              <li>Order ID: ${order.id}</li>
              <li>Amount: ${order.currency} ${order.amount}</li>
              <li>Cancellation Date: ${new Date().toLocaleDateString()}</li>
              <li>Reason: ${reason}</li>
            </ul>
          `,
        });
        break;

      // Add more email types here
      default:
        throw new Error('Invalid email type');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 