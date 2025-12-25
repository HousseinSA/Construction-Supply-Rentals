import { ObjectId } from 'mongodb';
import { BookingStatus } from '../types';

export interface BookingItem {
  equipmentId: ObjectId;
  supplierId?: ObjectId | null;
  equipmentName: string;
  pricingType?: string;
  rate: number;
  usage: number;
  usageUnit?: string;
  subtotal: number; 
}

export interface Booking {
  _id?: ObjectId;
  referenceNumber?: string;
  renterId: ObjectId;
  bookingItems: BookingItem[];
  totalPrice: number;
  grandTotal: number;
  status: BookingStatus;
  renterMessage?: string; 
  startDate?: Date;
  endDate?: Date;
  adminNotes?: string; 
  adminHandledBy?: ObjectId;
  adminHandledAt?: Date; 
  completedAt?: Date; 
  createdAt: Date;
  updatedAt: Date;
}