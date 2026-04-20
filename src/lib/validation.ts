import { ObjectId } from 'mongodb';
import { BookingStatus } from './types';
import { VALID_TRANSITIONS } from './constants/booking';

export function validateObjectId(id: string): boolean {
  return ObjectId.isValid(id);
}

export function validateBooking(booking: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!booking.renterId || !validateObjectId(booking.renterId)) {
    errors.push('Invalid renterId');
  }

  if (!booking.equipmentId || !validateObjectId(booking.equipmentId)) {
    errors.push('Invalid equipmentId');
  }

  if (!booking.usage || typeof booking.usage !== 'number' || booking.usage <= 0) {
    errors.push('Usage must be a positive number');
  }

  if (!booking.pricingType) {
    errors.push('Pricing type is required');
  }

  return { valid: errors.length === 0, errors };
}

export function validateStatusTransition(currentStatus: BookingStatus, newStatus: BookingStatus): boolean {
  return VALID_TRANSITIONS[currentStatus]?.includes(newStatus) || false;
}