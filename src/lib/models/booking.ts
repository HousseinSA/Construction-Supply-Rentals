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

export interface TransportDetails {
  porteCharId: ObjectId;
  porteCharName: string;
  supplierId?: ObjectId | null;
  supplierName?: string;
  distance: number;
  ratePerKm: number;
  transportCost: number;
}

export interface Booking {
  _id?: ObjectId;
  referenceNumber?: string;
  renterId: ObjectId;
  bookingItems: BookingItem[];
  totalPrice: number;
  transportDetails?: TransportDetails;
  grandTotal: number;
  status: BookingStatus;
  renterMessage?: string; 
  adminNotes?: string; 
  adminHandledBy?: ObjectId;
  adminHandledAt?: Date; 
  completedAt?: Date; 
  createdAt: Date;
  updatedAt: Date;
}