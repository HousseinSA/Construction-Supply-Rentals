import { ObjectId } from 'mongodb';
import { BookingStatus, PaymentMethod, PaymentStatus } from '../types';

export interface Booking {
  _id?: ObjectId;
  equipmentId: ObjectId;
  renterId: ObjectId;
  supplierId: ObjectId;
  startDate: Date;
  endDate: Date;
  rentalDays: number; // Calculated: days between start and end
  dailyPrice: number; // Equipment price at booking time
  totalPrice: number; // rentalDays * dailyPrice
  status: BookingStatus;
  message?: string; // Renter's message
  adminNotes?: string; // Admin's notes
  adminApprovedBy?: ObjectId; // Admin who approved
  adminApprovedAt?: Date; // When admin approved
  returnedAt?: Date; // When equipment was returned
  returnConfirmedBy?: ObjectId; // Admin who confirmed return
  returnNotes?: string; // Return condition notes
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