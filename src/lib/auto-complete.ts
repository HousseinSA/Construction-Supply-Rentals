import { Db, ObjectId, WithId, Document } from 'mongodb';

type Booking = WithId<Document>;
type Sale = WithId<Document>;

const formatEquipmentNames = (items: any[]) => 
  items.map(item => item.equipmentName + (item.equipmentReference ? ` (#${item.equipmentReference})` : ''));

const safeQuery = async <T>(fn: () => Promise<T[]>, errorMsg: string): Promise<T[]> => {
  try {
    return await fn();
  } catch (err) {
    console.error(errorMsg, err);
    return [];
  }
};

const safeUpdate = async (fn: () => Promise<any>, errorMsg: string): Promise<boolean> => {
  try {
    await fn();
    return true;
  } catch (err) {
    console.error(errorMsg, err);
    return false;
  }
};

async function sendBookingStartReminders(db: Db, adminEmail: string, now: Date, oneDayFromNow: Date) {
  const items = await safeQuery(
    () => db.collection('bookings').find({ startDate: { $gte: now, $lte: oneDayFromNow }, status: { $in: ['pending', 'paid'] } }).toArray(),
    'Error fetching bookings starting soon:'
  );

  let count = 0;
  for (const booking of items) {
    try {
      if (!adminEmail) continue;
      const { sendBookingStartReminderEmail } = await import('@/src/lib/email');
      const renter = await db.collection('users').findOne({ _id: new ObjectId(booking.renterId) });
      await sendBookingStartReminderEmail(adminEmail, {
        referenceNumber: booking.referenceNumber,
        equipmentNames: formatEquipmentNames(booking.bookingItems || []),
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalPrice: booking.totalPrice,
        status: booking.status,
        renterName: renter ? `${renter.firstName} ${renter.lastName}` : 'Unknown',
        renterPhone: renter?.phone || 'N/A'
      });
      count++;
    } catch (err) {
      console.error('Booking start reminder email error:', err);
    }
  }
  return count;
}

async function sendBookingEndReminders(db: Db, adminEmail: string, now: Date, oneDayFromNow: Date) {
  const items = await safeQuery(
    () => db.collection('bookings').find({ endDate: { $gte: now, $lte: oneDayFromNow }, status: 'pending' }).toArray(),
    'Error fetching pending bookings near end:'
  );

  let count = 0;
  for (const booking of items) {
    try {
      if (!adminEmail) continue;
      const { sendBookingPendingReminderEmail } = await import('@/src/lib/email');
      await sendBookingPendingReminderEmail(adminEmail, {
        referenceNumber: booking.referenceNumber,
        equipmentNames: formatEquipmentNames(booking.bookingItems || []),
        endDate: booking.endDate,
        totalPrice: booking.totalPrice,
        createdAt: booking.createdAt
      });
      count++;
    } catch (err) {
      console.error('Booking reminder email error:', err);
    }
  }
  return count;
}

async function cancelExpiredPendingBookings(db: Db, adminEmail: string, now: Date) {
  const items = await safeQuery(
    () => db.collection('bookings').find({ endDate: { $lte: now }, status: 'pending' }).toArray(),
    'Error fetching expired pending bookings:'
  );

  let count = 0;
  for (const booking of items) {
    const updated = await safeUpdate(
      () => db.collection('bookings').updateOne({ _id: booking._id }, { $set: { status: 'cancelled', updatedAt: now } }),
      'Error cancelling booking:'
    );
    if (!updated) continue;
    count++;

    try {
      if (!adminEmail) continue;
      const { sendBookingCancellationEmail } = await import('@/src/lib/email');
      const renter = await db.collection('users').findOne({ _id: new ObjectId(booking.renterId) });
      const suppliers = await Promise.all(
        (booking.bookingItems || []).map(async (item: any) => {
          if (!item.supplierId) return null;
          const supplier = await db.collection('users').findOne({ _id: new ObjectId(item.supplierId) });
          return supplier ? {
            name: `${supplier.firstName} ${supplier.lastName}`,
            phone: supplier.phone || 'N/A',
            equipment: item.equipmentName,
            duration: `${item.usage} ${item.usageUnit || ''}`
          } : null;
        })
      );

      await sendBookingCancellationEmail(adminEmail, {
        referenceNumber: booking.referenceNumber,
        equipmentNames: formatEquipmentNames(booking.bookingItems || []),
        totalPrice: booking.totalPrice,
        renterName: renter ? `${renter.firstName} ${renter.lastName}` : 'Unknown',
        renterPhone: renter?.phone || 'N/A',
        renterLocation: renter?.city,
        cancellationDate: now,
        createdAt: booking.createdAt,
        suppliers: suppliers.filter(s => s !== null)
      });
    } catch (err) {
      console.error('Booking cancellation email error:', err);
    }
  }
  return count;
}

async function completeExpiredPaidBookings(db: Db, now: Date) {
  const items = await safeQuery(
    () => db.collection('bookings').find({ endDate: { $lte: now }, status: 'paid' }).toArray(),
    'Error fetching expired paid bookings:'
  );

  let count = 0;
  for (const booking of items) {
    const updated = await safeUpdate(
      () => db.collection('bookings').updateOne({ _id: booking._id }, { $set: { status: 'completed', completedAt: now, updatedAt: now } }),
      'Error completing booking:'
    );
    if (updated) count++;
  }
  return count;
}

async function sendSaleReminders(db: Db, adminEmail: string, sixDaysAgo: Date, sevenDaysAgo: Date) {
  const items = await safeQuery(
    () => db.collection('sales').find({ createdAt: { $gte: sevenDaysAgo, $lte: sixDaysAgo }, status: 'pending' }).toArray(),
    'Error fetching pending sales near deadline:'
  );

  let count = 0;
  for (const sale of items) {
    try {
      if (!adminEmail) continue;
      const { sendSalePendingReminderEmail } = await import('@/src/lib/email');
      const equipment = await db.collection('equipment').findOne({ _id: new ObjectId(sale.equipmentId) });
      const equipmentName = equipment?.name || 'Unknown';
      const equipmentRef = equipment?.referenceNumber ? ` (#${equipment.referenceNumber})` : '';
      await sendSalePendingReminderEmail(adminEmail, {
        referenceNumber: sale.referenceNumber,
        equipmentName: equipmentName + equipmentRef,
        salePrice: sale.salePrice,
        createdAt: sale.createdAt
      });
      count++;
    } catch (err) {
      console.error('Sale reminder email error:', err);
    }
  }
  return count;
}

async function cancelOldPendingSales(db: Db, adminEmail: string, now: Date, sevenDaysAgo: Date) {
  const items = await safeQuery(
    () => db.collection('sales').find({ createdAt: { $lte: sevenDaysAgo }, status: 'pending' }).toArray(),
    'Error fetching old pending sales:'
  );

  let count = 0;
  for (const sale of items) {
    const updated = await safeUpdate(
      () => db.collection('sales').updateOne({ _id: sale._id }, { $set: { status: 'cancelled', updatedAt: now } }),
      'Error cancelling sale:'
    );
    if (!updated) continue;
    count++;

    try {
      if (!adminEmail) continue;
      const { sendSaleCancellationEmail } = await import('@/src/lib/email');
      const equipment = await db.collection('equipment').findOne({ _id: new ObjectId(sale.equipmentId) });
      const buyer = await db.collection('users').findOne({ _id: new ObjectId(sale.buyerId) });
      const equipmentName = equipment?.name || 'Unknown';
      const equipmentRef = equipment?.referenceNumber ? ` (#${equipment.referenceNumber})` : '';
      
      await sendSaleCancellationEmail(adminEmail, {
        referenceNumber: sale.referenceNumber,
        equipmentName: equipmentName + equipmentRef,
        salePrice: sale.salePrice,
        buyerName: buyer ? `${buyer.firstName} ${buyer.lastName}` : 'Unknown',
        buyerPhone: buyer?.phone || 'N/A',
        cancellationDate: now,
        createdAt: sale.createdAt
      });
    } catch (err) {
      console.error('Sale cancellation email error:', err);
    }
  }
  return count;
}

export async function processAutoCompletion(db: Db) {
  const now = new Date();
  const oneDayFromNow = new Date(now);
  oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);
  const sixDaysAgo = new Date(now);
  sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const adminEmail = process.env.ADMIN_EMAIL || '';

  const bookingsStartReminders = await sendBookingStartReminders(db, adminEmail, now, oneDayFromNow);
  const bookingsReminders = await sendBookingEndReminders(db, adminEmail, now, oneDayFromNow);
  const bookingsCancelled = await cancelExpiredPendingBookings(db, adminEmail, now);
  const bookingsCompleted = await completeExpiredPaidBookings(db, now);
  const salesReminders = await sendSaleReminders(db, adminEmail, sixDaysAgo, sevenDaysAgo);
  const salesCancelled = await cancelOldPendingSales(db, adminEmail, now, sevenDaysAgo);

  return {
    bookings: { completed: bookingsCompleted, cancelled: bookingsCancelled, reminders: bookingsReminders, startReminders: bookingsStartReminders },
    sales: { cancelled: salesCancelled, reminders: salesReminders }
  };
}
