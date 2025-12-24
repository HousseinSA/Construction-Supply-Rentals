import { ObjectId } from 'mongodb';
import { BookingStatus } from './types';

export function validateObjectId(id: string): boolean {
  return ObjectId.isValid(id);
}

export function validateBooking(booking: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!booking.renterId || !validateObjectId(booking.renterId)) {
    errors.push('Invalid renterId');
  }

  if (!booking.bookingItems || !Array.isArray(booking.bookingItems) || booking.bookingItems.length === 0) {
    errors.push('At least one booking item is required');
  }

  booking.bookingItems?.forEach((item: any, index: number) => {
    if (!item.equipmentId || !validateObjectId(item.equipmentId)) {
      errors.push(`Invalid equipmentId for item ${index + 1}`);
    }
    if (!item.usage || typeof item.usage !== 'number' || item.usage <= 0) {
      errors.push(`Usage must be a positive number for item ${index + 1}`);
    }
  });

  return { valid: errors.length === 0, errors };
}

export function validateStatusTransition(currentStatus: BookingStatus, newStatus: BookingStatus): boolean {
  const validTransitions: Record<BookingStatus, BookingStatus[]> = {
    'pending': ['paid', 'cancelled'],
    'paid': ['completed', 'cancelled'],
    'completed': [],
    'cancelled': []
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
}