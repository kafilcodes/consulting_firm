import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { updateOrderPayment } from '@/lib/firebase/services';

// Razorpay secret key - replace with environment variable in production
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'yoursecrethere';

export async function POST(request: Request) {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      orderId, // Our internal order ID
    } = await request.json();

    // Validate required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create signature verification string
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    
    // Generate expected signature
    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    // Verify signature
    const isValid = generatedSignature === razorpay_signature;

    if (!isValid) {
      console.error('Invalid Razorpay signature');
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Update order payment status
    await updateOrderPayment(orderId, {
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      paymentStatus: 'paid',
      paymentResponse: {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
      },
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
} 