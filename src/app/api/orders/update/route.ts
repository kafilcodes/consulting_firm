import { NextResponse } from 'next/server';
import { updateOrderPayment } from '@/lib/firebase/services';
import { auth } from '@/lib/firebase/auth';

export async function POST(request: Request) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    
    if (!decodedToken.uid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get update data from request
    const { orderId, paymentData } = await request.json();
    
    // Validate required fields
    if (!orderId || !paymentData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update order payment status in Firestore
    await updateOrderPayment(orderId, {
      ...paymentData,
      updatedAt: new Date(),
    });

    return NextResponse.json({ 
      success: true,
      message: 'Order updated successfully' 
    });
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
} 