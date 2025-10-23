import { Db, ObjectId } from 'mongodb';
import { BookingStatus } from './types';
import { validateStatusTransition } from './validation';
import { Booking } from './models/booking';

export async function updateBookingStatus(
  db: Db,
  bookingId: ObjectId,
  newStatus: BookingStatus,
  adminId?: ObjectId,
  adminNotes?: string
): Promise<void> {
  const booking = await db.collection('bookings').findOne({ _id: bookingId });
  
  if (!booking) {
    throw new Error('Booking not found');
  }

  if (!validateStatusTransition(booking.status, newStatus)) {
    throw new Error(`Invalid status transition from ${booking.status} to ${newStatus}`);
  }

  const updateData: Partial<Booking> = {
    status: newStatus,
    updatedAt: new Date()
  };

  if (newStatus === 'paid' && adminId) {
    updateData.adminHandledBy = adminId;
    updateData.adminHandledAt = new Date();
  }

  if (newStatus === 'completed') {
    updateData.completedAt = new Date();
  }

  if (adminNotes) {
    updateData.adminNotes = adminNotes;
  }

  await db.collection('bookings').updateOne(
    { _id: bookingId },
    { $set: updateData }
  );
}