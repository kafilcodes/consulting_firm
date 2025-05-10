import { NextRequest, NextResponse } from 'next/server';
import { getServiceById } from '@/lib/firebase/services';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the service ID from the URL params
    const serviceId = params.id;
    if (!serviceId) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    // Get the service from Firestore
    const service = await getServiceById(serviceId);
    
    // Check if the service exists
    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Return the service
    return NextResponse.json(service);
  } catch (error) {
    console.error('Error getting service:', error);
    return NextResponse.json(
      { error: 'Failed to get service' },
      { status: 500 }
    );
  }
} 