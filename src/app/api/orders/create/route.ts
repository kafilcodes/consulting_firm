import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/firebase/services';
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

    // Get order data from request
    const orderData = await request.json();
    
    // Validate required fields
    if (!orderData.serviceId || !orderData.amount || !orderData.serviceName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create order in Firestore with client ID from auth token
    const orderId = await createOrder({
      clientId: decodedToken.uid,
      serviceId: orderData.serviceId,
      serviceName: orderData.serviceName,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      status: 'pending',
      paymentStatus: 'pending',
      documents: [],
      timeline: [
        {
          id: crypto.randomUUID(),
          status: 'pending',
          message: 'Order created',
          timestamp: new Date(),
          updatedBy: decodedToken.uid
        }
      ]
    });

    return NextResponse.json({ 
      success: true,
      id: orderId 
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
} 