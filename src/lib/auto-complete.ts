import { Db, ObjectId } from 'mongodb';

export async function processAutoCompletion(db: Db) {
  const now = new Date();
  const oneDayFromNow = new Date(now);
  oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

  let bookingsCompleted = 0;
  let bookingsCancelled = 0;
  let bookingsReminders = 0;
  let salesCancelled = 0;
  let salesReminders = 0;

  // === BOOKINGS ===
  
  // 1. Send reminder for pending bookings ending in 24 hours
  const pendingBookingsNearEnd = await db.collection('bookings').find({
    endDate: { $gte: now, $lte: oneDayFromNow },
    status: 'pending'
  }).toArray();

  for (const booking of pendingBookingsNearEnd) {
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        const { sendBookingPendingReminderEmail } = await import('@/src/lib/email');
        const equipmentNames = (booking.bookingItems || []).map((item: any) => 
          item.equipmentName + (item.equipmentReference ? ` (#${item.equipmentReference})` : '')
        );
        await sendBookingPendingReminderEmail(adminEmail, {
          referenceNumber: booking.referenceNumber,
          equipmentNames,
          endDate: booking.endDate,
          totalPrice: booking.totalPrice,
          createdAt: booking.createdAt
        });
        bookingsReminders++;
      }
    } catch (err) {
      console.error('Booking reminder email error:', err);
    }
  }

  // 2. Auto-cancel pending bookings that have ended
  const expiredPendingBookings = await db.collection('bookings').find({
    endDate: { $lte: now },
    status: 'pending'
  }).toArray();

  for (const booking of expiredPendingBookings) {
    await db.collection('bookings').updateOne(
      { _id: booking._id },
      { $set: { status: 'cancelled', updatedAt: now } }
    );
    bookingsCancelled++;

    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        const { sendBookingCancellationEmail } = await import('@/src/lib/email');
        const renter = await db.collection('users').findOne({ _id: new ObjectId(booking.renterId) });
        const equipmentNames = (booking.bookingItems || []).map((item: any) => 
          item.equipmentName + (item.equipmentReference ? ` (#${item.equipmentReference})` : '')
        );
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
          equipmentNames,
          totalPrice: booking.totalPrice,
          renterName: renter ? `${renter.firstName} ${renter.lastName}` : 'Unknown',
          renterPhone: renter?.phone || 'N/A',
          renterLocation: renter?.city,
          cancellationDate: now,
          createdAt: booking.createdAt,
          suppliers: suppliers.filter(s => s !== null)
        });
      }
    } catch (err) {
      console.error('Booking cancellation email error:', err);
    }
  }

  // 3. Auto-complete paid bookings that have ended
  const expiredPaidBookings = await db.collection('bookings').find({
    endDate: { $lte: now },
    status: 'paid'
  }).toArray();

  for (const booking of expiredPaidBookings) {
    await db.collection('bookings').updateOne(
      { _id: booking._id },
      { $set: { status: 'completed', completedAt: now, updatedAt: now } }
    );
    bookingsCompleted++;
  }

  // === SALES ===
  
  // 1. Send reminder for pending sales created 6 days ago (1 day before 7-day deadline)
  const sixDaysAgo = new Date(now);
  sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const pendingSalesNearDeadline = await db.collection('sales').find({
    createdAt: { $gte: sevenDaysAgo, $lte: sixDaysAgo },
    status: 'pending'
  }).toArray();

  for (const sale of pendingSalesNearDeadline) {
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
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
        salesReminders++;
      }
    } catch (err) {
      console.error('Sale reminder email error:', err);
    }
  }

  // 2. Auto-cancel pending sales older than 7 days
  const oldPendingSales = await db.collection('sales').find({
    createdAt: { $lte: sevenDaysAgo },
    status: 'pending'
  }).toArray();

  for (const sale of oldPendingSales) {
    await db.collection('sales').updateOne(
      { _id: sale._id },
      { $set: { status: 'cancelled', updatedAt: now } }
    );
    salesCancelled++;

    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
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
      }
    } catch (err) {
      console.error('Sale cancellation email error:', err);
    }
  }

  return {
    bookings: {
      completed: bookingsCompleted,
      cancelled: bookingsCancelled,
      reminders: bookingsReminders
    },
    sales: {
      cancelled: salesCancelled,
      reminders: salesReminders
    }
  };
}
