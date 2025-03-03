import { NextResponse } from 'next/server';
import { verifyPayment, updateOrderPayment } from '@/lib/firebase/services';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const {
      payload: { payment: { entity } },
    } = payload;

    const { order_id, id: paymentId, status } = entity;
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify payment signature
    const isValid = await verifyPayment(order_id, paymentId, signature);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Update order status
    await updateOrderPayment(order_id, {
      paymentId,
      paymentStatus: status === 'captured' ? 'paid' : 'failed',
      paymentResponse: entity,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 