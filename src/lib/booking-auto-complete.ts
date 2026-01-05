import { Db, ObjectId } from 'mongodb';

export async function processBookingAutoCompletion(db: Db): Promise<{ completed: number; cancelled: number; reminders: number }> {
  const now = new Date();
  let completed = 0;
  let cancelled = 0;
  let reminders = 0;

  // 1. Send WARNING email for bookings ending in 1 minute (before cancellation)
  const warningDate = new Date(now);
  warningDate.setMinutes(warningDate.getMinutes() + 1);

  const warningBookings = await db.collection('bookings').find({
    endDate: { $gt: now, $lte: warningDate },
    status: 'pending'
  }).toArray();

  for (const booking of warningBookings) {
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        const { sendBookingPendingReminderEmail } = await import('@/src/lib/email');
        const equipmentNames = (booking.bookingItems || []).map((item: { equipmentName: string }) => item.equipmentName);
        await sendBookingPendingReminderEmail(adminEmail, {
          referenceNumber: booking.referenceNumber,
          equipmentNames,
          endDate: booking.endDate,
          totalPrice: booking.totalPrice
        }).catch(err => console.error('Email error:', err));
        reminders++;
      }
    } catch (err) {
      console.error('Error sending reminder email:', err);
    }
  }

  // 2. Process KM-rate bookings (2-day window from startDate)
  const kmBookings = await db.collection('bookings').find({
    'bookingItems': { 
      $elemMatch: { pricingType: 'per_km' }
    },
    status: { $in: ['pending', 'paid'] }
  }).toArray();

  for (const booking of kmBookings) {
    const twoDaysFromStart = new Date(booking.startDate);
    twoDaysFromStart.setDate(twoDaysFromStart.getDate() + 2);

    if (now >= twoDaysFromStart) {
      if (booking.status === 'pending') {
        // Auto-cancel unpaid km bookings after 2 days
        await db.collection('bookings').updateOne(
          { _id: booking._id },
          { $set: { status: 'cancelled', updatedAt: new Date() } }
        );
        cancelled++;

        // Send cancellation email
        try {
          const adminEmail = process.env.ADMIN_EMAIL;
          if (adminEmail) {
            const { sendBookingCancellationEmail } = await import('@/src/lib/email');
            const renter = await db.collection('users').findOne({ _id: new ObjectId(booking.renterId) });
            const suppliers = await Promise.all(
              (booking.bookingItems || []).map(async (item: { supplierId?: string; equipmentName: string; usage: number; usageUnit?: string }) => {
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
              equipmentNames: (booking.bookingItems || []).map((item: { equipmentName: string }) => item.equipmentName),
              totalPrice: booking.totalPrice,
              renterName: renter ? `${renter.firstName} ${renter.lastName}` : 'Unknown',
              renterPhone: renter?.phone || 'N/A',
              renterLocation: renter?.city,
              cancellationDate: new Date(),
              suppliers: suppliers.filter(s => s !== null) as Array<{ name: string; phone: string; equipment: string; duration: string }>
            }).catch(err => console.error('Email error:', err));
          }
        } catch (err) {
          console.error('Error sending cancellation email:', err);
        }
      } else if (booking.status === 'paid') {
        // Auto-complete paid km bookings after 2 days silently
        await db.collection('bookings').updateOne(
          { _id: booking._id },
          { $set: { status: 'completed', completedAt: new Date(), updatedAt: new Date() } }
        );
        completed++;
      }
    }
  }

  // 3. Cancel regular bookings (hourly/daily/monthly) ending NOW or in past
  const expiredBookings = await db.collection('bookings').find({
    'bookingItems': { 
      $not: { $elemMatch: { pricingType: 'per_km' } }
    },
    endDate: { $lte: now },
    status: { $in: ['pending', 'paid'] }
  }).toArray();

  for (const booking of expiredBookings) {
    if (booking.status === 'pending') {
      // Auto-cancel
      await db.collection('bookings').updateOne(
        { _id: booking._id },
        { $set: { status: 'cancelled', updatedAt: new Date() } }
      );
      cancelled++;

      // Send cancellation email
      try {
        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail) {
          const { sendBookingCancellationEmail } = await import('@/src/lib/email');
          const renter = await db.collection('users').findOne({ _id: new ObjectId(booking.renterId) });
          const suppliers = await Promise.all(
            (booking.bookingItems || []).map(async (item: { supplierId?: string; equipmentName: string; usage: number; usageUnit?: string }) => {
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
            equipmentNames: (booking.bookingItems || []).map((item: { equipmentName: string }) => item.equipmentName),
            totalPrice: booking.totalPrice,
            renterName: renter ? `${renter.firstName} ${renter.lastName}` : 'Unknown',
            renterPhone: renter?.phone || 'N/A',
            renterLocation: renter?.city,
            cancellationDate: new Date(),
            suppliers: suppliers.filter(s => s !== null) as Array<{ name: string; phone: string; equipment: string; duration: string }>
          }).catch(err => console.error('Email error:', err));
        }
      } catch (err) {
        console.error('Error sending cancellation email:', err);
      }
    } else if (booking.status === 'paid') {
      // Auto-complete silently
      await db.collection('bookings').updateOne(
        { _id: booking._id },
        { $set: { status: 'completed', completedAt: new Date(), updatedAt: new Date() } }
      );
      completed++;
    }
  }

  return { completed, cancelled, reminders };
}
