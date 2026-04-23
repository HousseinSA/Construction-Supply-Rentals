import { Db, ObjectId } from 'mongodb';

export function calculateBookingEndDate(
  startDate: Date | string,
  usage: number,
  pricingType: string
): Date {
  const start = new Date(startDate);
  
  switch (pricingType) {
    case 'hourly':
      return new Date(start.getTime() + usage * 60 * 60 * 1000);
    case 'daily':
      return new Date(start.getTime() + usage * 24 * 60 * 60 * 1000);
    case 'monthly':
      const monthEnd = new Date(start);
      monthEnd.setMonth(monthEnd.getMonth() + usage);
      return monthEnd;
    case 'per_km':
      return new Date(start.getTime() + 2 * 24 * 60 * 60 * 1000);
    default:
      return start;
  }
}

export async function calculateSubtotal(
  db: Db,
  equipmentId: ObjectId,
  usage: number,
  pricingType?: string
): Promise<{ rate: number; subtotal: number; equipmentName: string; supplierId: ObjectId; usageUnit: string; pricingType: string }> {
  const equipment = await db.collection('equipment').findOne({ _id: equipmentId });
  
  if (!equipment) {
    throw new Error('Equipment not found');
  }

  let rate = 0;
  let usageUnit = 'hours';
  const selectedPricingType = pricingType || equipment.pricing.type;

  switch (selectedPricingType) {
    case 'hourly': 
      rate = equipment.pricing.hourlyRate || 0;
      usageUnit = 'hours';
      break;
    case 'daily': 
      rate = equipment.pricing.dailyRate || 0;
      usageUnit = 'days';
      break;
    case 'monthly': 
      rate = equipment.pricing.monthlyRate || 0;
      usageUnit = 'months';
      break;
    case 'per_km': 
      rate = equipment.pricing.kmRate || 0;
      usageUnit = 'km';
      break;
    case 'per_ton': 
      rate = equipment.pricing.tonRate || 0;
      usageUnit = 'tons';
      break;
  }

  if (rate === 0) {
    throw new Error(`Invalid pricing type: ${selectedPricingType}`);
  }

  return {
    rate,
    subtotal: rate * usage,
    equipmentName: equipment.name,
    supplierId: equipment.supplierId,
    usageUnit,
    pricingType: selectedPricingType
  };
}

export async function checkEquipmentAvailability(
  db: Db,
  equipmentId: ObjectId,
  startDate?: Date | string,
  endDate?: Date | string
): Promise<boolean> {
  const query: { [key: string]: unknown } = {
    'bookingItems.equipmentId': equipmentId,
    status: { $in: ['pending', 'paid'] }
  };

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    query.$expr = {
      $and: [
        { $lt: ['$startDate', end] },
        { $gt: ['$endDate', start] }
      ]
    };
  }

  const activeBooking = await db.collection('bookings').findOne(query);
  return !activeBooking;
}

export async function getConflictingBooking(
  db: Db,
  equipmentId: ObjectId,
  startDate?: Date | string,
  endDate?: Date | string
): Promise<{ startDate: Date; endDate: Date } | null> {
  const query: { [key: string]: unknown } = {
    'bookingItems.equipmentId': equipmentId,
    status: { $in: ['pending', 'paid'] }
  };

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    query.$expr = {
      $and: [
        { $lt: ['$startDate', end] },
        { $gt: ['$endDate', start] }
      ]
    };
  }

  const conflictingBooking = await db.collection('bookings').findOne(query, {
    projection: { startDate: 1, endDate: 1 }
  });
  
  return conflictingBooking ? { startDate: conflictingBooking.startDate, endDate: conflictingBooking.endDate } : null;
}

export async function validateReferences(
  db: Db,
  booking: { renterId: string; bookingItems: Array<{ equipmentId: string }> }
): Promise<string[]> {
  const errors: string[] = [];

  const renter = await db.collection('users').findOne({ _id: new ObjectId(booking.renterId) });
  if (!renter) errors.push('renter_not_found');

  for (const item of booking.bookingItems) {
    const equipmentId = new ObjectId(item.equipmentId);
    const equipment = await db.collection('equipment').findOne({ _id: equipmentId });
    
    if (!equipment) {
      errors.push('equipment_not_found');
    } else if (equipment.status !== 'approved') {
      errors.push('equipment_not_approved');
    }
  }

  return errors;
}

export function determineEndDate(
  startDate: Date | undefined,
  endDate: Date | undefined,
  usage: number,
  pricingType: string
): Date | undefined {
  if (!startDate) return endDate ? new Date(endDate) : undefined

  if (endDate && pricingType === "daily") {
    return new Date(endDate)
  }

  if (
    pricingType === "hourly" ||
    pricingType === "per_km" ||
    pricingType === "monthly"
  ) {
    return calculateBookingEndDate(startDate, usage, pricingType)
  }

  return endDate ? new Date(endDate) : undefined
}

export function buildBookingDocument(
  params: {
    renterId: string
    usage: number
    renterMessage?: string
    startDate?: Date
    endDate?: Date
  },
  calculation: {
    rate: number
    subtotal: number
    equipmentName: string
    supplierId: ObjectId
    usageUnit: string
    pricingType: string
  },
  referenceNumber: string,
  equipmentId: ObjectId,
  commission: number,
  calculatedEndDate?: Date
) {
  return {
    referenceNumber,
    renterId: new ObjectId(params.renterId),
    bookingItems: [
      {
        equipmentId,
        supplierId: calculation.supplierId,
        equipmentName: calculation.equipmentName,
        pricingType: calculation.pricingType,
        rate: calculation.rate,
        usage: params.usage,
        usageUnit: calculation.usageUnit,
        subtotal: calculation.subtotal,
        commission,
      },
    ],
    totalPrice: calculation.subtotal,
    totalCommission: commission,
    grandTotal: calculation.subtotal,
    status: "pending" as const,
    renterMessage: params.renterMessage || "",
    startDate: params.startDate ? new Date(params.startDate) : undefined,
    endDate: calculatedEndDate || (params.endDate ? new Date(params.endDate) : undefined),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}