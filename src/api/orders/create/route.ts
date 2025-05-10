import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase/auth-admin';
import { db } from '@/lib/firebase/admin';
import { getServiceById } from '@/lib/data/services-data';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (error) {
      console.error('Error verifying token:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decodedToken.uid;

    // Parse request body
    const body = await request.json();
    const { serviceId, amount, currency, clientDetails } = body;

    // Validate required fields
    if (!serviceId || !amount || !currency || !clientDetails) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get service details (in production, fetch from database)
    const service = getServiceById(serviceId);
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Generate a unique order ID
    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create order document in Firestore
    const orderRef = db.collection('orders').doc(orderId);
    
    await orderRef.set({
      orderId,
      userId,
      serviceId,
      serviceName: service.name,
      amount,
      currency,
      clientDetails,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Return success response with order ID
    return NextResponse.json({ 
      success: true, 
      orderId,
      message: 'Order created successfully' 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
