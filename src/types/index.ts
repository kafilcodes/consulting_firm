export interface Service {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  category: ServiceCategory;
  price: {
    amount: number;
    currency: string;
    billingType: 'one-time' | 'monthly' | 'yearly';
  };
  features: string[];
  requirements: string[];
  deliverables: string[];
  estimatedDuration: string;
  image?: string;
}

export type ServiceCategory = 
  | 'ca-services'
  | 'audit'
  | 'registration'
  | 'tax'
  | 'consulting';

export interface Order {
  id: string;
  clientId: string;
  serviceId: string;
  status: OrderStatus;
  amount: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  paymentStatus: PaymentStatus;
  documents?: OrderDocument[];
  timeline: OrderTimeline[];
  assignedTo?: string;
}

export type OrderStatus = 
  | 'pending'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'on-hold';

export type PaymentStatus = 
  | 'pending'
  | 'partial'
  | 'completed'
  | 'refunded'
  | 'failed';

export type DocumentCategory = 
  | 'contract'
  | 'invoice'
  | 'report'
  | 'identification'
  | 'financial'
  | 'legal'
  | 'other';

export interface OrderDocument {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  category: DocumentCategory;
  uploadedAt: string;
}

export interface OrderTimeline {
  id: string;
  status: OrderStatus;
  message: string;
  timestamp: Date;
  updatedBy: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  createdAt: string | Date;
  lastSignInTime: string | Date;
  updatedAt?: string | Date;
  lastLoginAt?: string | Date;
}

export interface UserData extends Omit<User, 'createdAt' | 'lastSignInTime'> {
  createdAt: string;
  lastSignInTime: string;
}

export type UserRole = 
  | 'client'
  | 'admin'
  | 'employee'
  | 'manager'; 