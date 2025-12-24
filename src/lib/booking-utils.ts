import { Db, ObjectId } from 'mongodb';

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
  let selectedPricingType = pricingType || equipment.pricing.type;

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
    supplierId: equipment.createdById,
    usageUnit,
    pricingType: selectedPricingType
  };
}

export async function checkEquipmentAvailability(
  db: Db,
  equipmentId: ObjectId
): Promise<boolean> {
  const activeBooking = await db.collection('bookings').findOne({
    'bookingItems.equipmentId': equipmentId,
    status: { $in: ['pending', 'paid'] }
  });
  
  return !activeBooking;
}

export async function validateReferences(db: Db, booking: any): Promise<string[]> {
  const errors: string[] = [];

  const renter = await db.collection('users').findOne({ _id: new ObjectId(booking.renterId) });
  if (!renter) errors.push('Renter not found');

  for (const item of booking.bookingItems) {
    const equipmentId = new ObjectId(item.equipmentId);
    const equipment = await db.collection('equipment').findOne({ _id: equipmentId });
    
    if (!equipment) {
      errors.push(`Equipment ${item.equipmentId} not found`);
    } else if (equipment.status !== 'approved') {
      errors.push(`Equipment ${equipment.name} is not approved for booking`);
    } else {
      const available = await checkEquipmentAvailability(db, equipmentId);
      if (!available) {
        errors.push(`Equipment ${equipment.name} is currently unavailable (already booked)`);
      }
    }
  }

  return errors;
}