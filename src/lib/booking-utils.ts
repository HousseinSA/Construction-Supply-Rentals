import { Db, ObjectId } from 'mongodb';

export async function calculateSubtotal(
  db: Db,
  equipmentId: ObjectId,
  usage: number
): Promise<{ rate: number; subtotal: number; equipmentName: string; supplierId: ObjectId }> {
  const equipment = await db.collection('equipment').findOne({ _id: equipmentId });
  
  if (!equipment) {
    throw new Error('Equipment not found');
  }

  let rate = 0;
  switch (equipment.pricing.type) {
    case 'hourly': rate = equipment.pricing.hourlyRate || 0; break;
    case 'daily': rate = equipment.pricing.dailyRate || 0; break;
    case 'per_km': rate = equipment.pricing.kmRate || 0; break;
    case 'per_ton': rate = equipment.pricing.tonRate || 0; break;
  }

  return {
    rate,
    subtotal: rate * usage,
    equipmentName: equipment.name,
    supplierId: equipment.supplierId
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

  // Check renter exists
  const renter = await db.collection('users').findOne({ _id: new ObjectId(booking.renterId) });
  if (!renter) errors.push('Renter not found');

  // Check equipment exists, is approved, and available
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