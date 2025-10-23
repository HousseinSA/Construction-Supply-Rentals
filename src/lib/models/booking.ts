import { ObjectId } from 'mongodb';
import { BookingStatus } from '../types';

// Individual equipment item in a booking
export interface BookingItem {
  equipmentId: ObjectId;
  supplierId: ObjectId;
  equipmentName: string;
  rate: number; // Price per hour/day/km/ton from equipment
  usage: number; // Hours/days/km/tons requested (based on equipment pricing type)
  subtotal: number; // rate * usage
}

// Usage-based booking (no dates)
export interface Booking {
  _id?: ObjectId;
  renterId: ObjectId;
  bookingItems: BookingItem[]; // Multiple equipment items
  totalPrice: number; // Sum of all subtotals
  status: BookingStatus;
  renterMessage?: string; // Renter's initial message
  adminNotes?: string; // Admin's private notes about arrangements
  adminHandledBy?: ObjectId; // Which admin is handling this
  adminHandledAt?: Date; // When admin started handling
  completedAt?: Date; // When everything was completed
  createdAt: Date;
  updatedAt: Date;
}