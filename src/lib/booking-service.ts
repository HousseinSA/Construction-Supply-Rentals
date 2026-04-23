import { Db, ObjectId } from 'mongodb';
import { BookingStatus } from './types';
import { validateStatusTransition } from './validation';
import { Booking, BookingItem } from './models/booking';
import { 
  calculateSubtotal, 
  validateReferences, 
  determineEndDate,
  buildBookingDocument
} from './booking-utils';
import { generateReferenceNumber } from './reference-number';
import { validateBookingAvailability } from './api-helpers/booking-validation-helpers';
import { sendBookingCancelledByRenterNotification } from './api-helpers/booking-email-helpers';

export interface CreateBookingParams {
  renterId: string
  equipmentId: string
  usage: number
  pricingType?: string
  startDate?: Date
  endDate?: Date
  renterMessage?: string
  commission?: number
}

export interface CreateBookingResult {
  id: ObjectId
  referenceNumber: string
  totalPrice: number
  status: string
  equipmentName: string
  usage: number
  rate: number
  subtotal: number
  equipment: any
  bookingItems: BookingItem[]
  commission: number
  calculatedEndDate?: Date
  equipmentReferenceNumber?: string
}

export async function createBooking(
  db: Db,
  params: CreateBookingParams
): Promise<CreateBookingResult> {
  const equipmentId = new ObjectId(params.equipmentId)
  const bookingItems = [{ equipmentId: params.equipmentId }]

  const refErrors = await validateReferences(db, { ...params, bookingItems })
  if (refErrors.length > 0) {
    throw new Error(refErrors.join(", "))
  }

  const calculation = await calculateSubtotal(db, equipmentId, params.usage, params.pricingType)
  const calculatedEndDate = determineEndDate(params.startDate, params.endDate, params.usage, calculation.pricingType)

  const availabilityCheck = await validateBookingAvailability(
    db,
    equipmentId,
    params.startDate,
    calculatedEndDate,
  )

  if (!availabilityCheck.available) {
    const error: any = new Error(availabilityCheck.error)
    error.conflictingDates = availabilityCheck.conflictingDates
    error.statusCode = 409
    throw error
  }

  const commission = params.commission || 0
  const referenceNumber = await generateReferenceNumber("booking")
  const bookingDoc = buildBookingDocument(
    params,
    calculation,
    referenceNumber,
    equipmentId,
    commission,
    calculatedEndDate
  )

  const result = await db.collection("bookings").insertOne(bookingDoc)
  const equipment = await db.collection("equipment").findOne({ _id: equipmentId })

  return {
    id: result.insertedId,
    referenceNumber,
    totalPrice: calculation.subtotal,
    status: "pending",
    equipmentName: calculation.equipmentName,
    usage: params.usage,
    rate: calculation.rate,
    subtotal: calculation.subtotal,
    equipment: equipment || null,
    bookingItems: bookingDoc.bookingItems,
    commission,
    calculatedEndDate,
    equipmentReferenceNumber: equipment?.referenceNumber,
  }
}

export async function handleBookingCancellation(
  db: Db,
  bookingId: ObjectId,
  adminId?: string
): Promise<void> {
  const booking = await db.collection("bookings").findOne({ _id: bookingId })
  
  if (!booking) {
    throw new Error("Booking not found")
  }

  if (booking.status !== "pending") {
    throw new Error("Only pending bookings can be cancelled. Please contact support for assistance.")
  }

  if (!adminId) {
    await sendBookingCancelledByRenterNotification(db, {
      referenceNumber: booking.referenceNumber,
      renterId: booking.renterId,
      bookingItems: booking.bookingItems,
    })
  }
}

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