import { ObjectId } from 'mongodb';
import { BookingStatus, PaymentMethod, PaymentStatus } from '../types';

export interface Booking {
  _id?: ObjectId;
  equipmentId: ObjectId;
  renterId: ObjectId;
  supplierId: ObjectId;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: BookingStatus;
  message?: string; // Renter's message
  adminNotes?: string; // Admin's notes
  adminApprovedBy?: ObjectId; // Admin who approved
  adminApprovedAt?: Date; // When admin approved
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  _id?: ObjectId;
  bookingId: ObjectId;
  amount: number;
  commissionAmount: number;
  commissionRate: number;
  paymentMethod: PaymentMethod;
  paymentProof?: string; // Cloudinary URL for mobile_money
  status: PaymentStatus;
  paidAt?: Date;
  confirmedAt?: Date;
  confirmedBy?: ObjectId; // Admin ID
  createdAt: Date;
}