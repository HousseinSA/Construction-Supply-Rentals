import { Db, ObjectId } from 'mongodb';
import {
  sendBookingStartReminderEmail,
  sendBookingPendingReminderEmail,
  sendBookingCancellationEmail,
  sendSalePendingReminderEmail,
  sendSaleCancellationEmail,
  type BookingStartReminderDetails,
  type BookingEmailDetails,
  type BookingCancellationDetails,
  type SaleEmailDetails,
  type SaleCancellationDetails
} from '@/src/lib/email';

const SALE_REMINDER_DAYS = 6;
const SALE_CANCEL_DAYS = 7;
const BOOKING_REMINDER_DAYS = 1;

const getDayRange = (daysOffset: number) => {
  const start = new Date();
  start.setDate(start.getDate() + daysOffset);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};

const formatEquipmentNames = (items: any[]) => 
  items.map(item => item.equipmentName);

const getEquipmentReferences = (items: any[]) => 
  items.map(item => item.equipmentReference || '');

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

async function sendEmailsInParallel<T>(
  items: T[],
  emailFn: (item: T) => Promise<void>,
  adminEmail?: string
): Promise<number> {
  if (!adminEmail || items.length === 0) return 0;

  const emailPromises = items.map(async (item) => {
    try {
      await emailFn(item);
    } catch (err) {
      console.error('Email sending error:', err);
      throw err;
    }
  });

  const results = await Promise.allSettled(emailPromises);
  return results.filter(r => r.status === 'fulfilled').length;
}

async function sendBookingStartReminders(db: Db, adminEmail: string, tomorrowStart: Date, tomorrowEnd: Date) {
  const items = await safeQuery(
    () => db.collection('bookings').find({ startDate: { $gte: tomorrowStart, $lt: tomorrowEnd }, status: { $in: ['pending', 'paid'] } }).toArray(),
    'Error fetching bookings starting soon:'
  );

  return sendEmailsInParallel(items, async (booking) => {
    const renter = await db.collection('users').findOne({ _id: new ObjectId(booking.renterId) });
    const suppliers = await Promise.all(
      (booking.bookingItems || []).map(async (item: any) => {
        if (!item.supplierId) return null;
        const supplier = await db.collection('users').findOne({ _id: new ObjectId(item.supplierId) });
        return supplier ? { name: `${supplier.firstName} ${supplier.lastName}`, phone: supplier.phone || 'N/A' } : null;
      })
    );
    const uniqueSuppliers = Array.from(
      new Map(suppliers.filter(s => s !== null).map((s: any) => [s.phone, s])).values()
    );
    
    const details: BookingStartReminderDetails = {
      referenceNumber: booking.referenceNumber,
      equipmentNames: formatEquipmentNames(booking.bookingItems || []),
      equipmentReferences: getEquipmentReferences(booking.bookingItems || []),
      totalPrice: booking.totalPrice,
      renterName: renter ? `${renter.firstName} ${renter.lastName}` : 'Unknown',
      renterPhone: renter?.phone || 'N/A',
      suppliers: uniqueSuppliers,
      createdAt: booking.createdAt,
      startDate: booking.startDate,
      endDate: booking.endDate,
      status: booking.status
    };
    
    await sendBookingStartReminderEmail(adminEmail!, details);
  }, adminEmail);
}

async function sendBookingEndReminders(db: Db, adminEmail: string, tomorrowStart: Date, tomorrowEnd: Date) {
  const items = await safeQuery(
    () => db.collection('bookings').find({ endDate: { $gte: tomorrowStart, $lt: tomorrowEnd }, status: 'pending' }).toArray(),
    'Error fetching pending bookings near end:'
  );

  return sendEmailsInParallel(items, async (booking) => {
    const renter = await db.collection('users').findOne({ _id: new ObjectId(booking.renterId) });
    const suppliers = await Promise.all(
      (booking.bookingItems || []).map(async (item: any) => {
        if (!item.supplierId) return null;
        const supplier = await db.collection('users').findOne({ _id: new ObjectId(item.supplierId) });
        return supplier ? { name: `${supplier.firstName} ${supplier.lastName}`, phone: supplier.phone || 'N/A' } : null;
      })
    );
    const uniqueSuppliers = Array.from(
      new Map(suppliers.filter(s => s !== null).map((s: any) => [s.phone, s])).values()
    );
    
    const details: BookingEmailDetails & { endDate: Date } = {
      referenceNumber: booking.referenceNumber,
      equipmentNames: formatEquipmentNames(booking.bookingItems || []),
      equipmentReferences: getEquipmentReferences(booking.bookingItems || []),
      totalPrice: booking.totalPrice,
      renterName: renter ? `${renter.firstName} ${renter.lastName}` : 'Unknown',
      renterPhone: renter?.phone || 'N/A',
      suppliers: uniqueSuppliers,
      createdAt: booking.createdAt,
      endDate: booking.endDate
    };
    
    await sendBookingPendingReminderEmail(adminEmail!, details);
  }, adminEmail);
}

async function cancelExpiredPendingBookings(db: Db, adminEmail: string, now: Date) {
  const items = await safeQuery(
    () => db.collection('bookings').find({ endDate: { $lte: now }, status: 'pending' }).toArray(),
    'Error fetching expired pending bookings:'
  );

  const updateResults = await Promise.allSettled(
    items.map(booking => 
      safeUpdate(
        () => db.collection('bookings').updateOne({ _id: booking._id }, { $set: { status: 'cancelled', updatedAt: now } }),
        'Error cancelling booking:'
      )
    )
  );
  const count = updateResults.filter(r => r.status === 'fulfilled' && r.value === true).length;

  await sendEmailsInParallel(items, async (booking) => {
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

    const details: BookingCancellationDetails = {
      referenceNumber: booking.referenceNumber,
      equipmentNames: formatEquipmentNames(booking.bookingItems || []),
      equipmentReferences: getEquipmentReferences(booking.bookingItems || []),
      totalPrice: booking.totalPrice,
      renterName: renter ? `${renter.firstName} ${renter.lastName}` : 'Unknown',
      renterPhone: renter?.phone || 'N/A',
      renterLocation: renter?.city,
      suppliers: suppliers.filter(s => s !== null).map((s, idx) => ({
        ...s!,
        equipmentRef: (booking.bookingItems || [])[idx]?.equipmentReference || ''
      })),
      createdAt: booking.createdAt,
      cancellationDate: now
    };

    await sendBookingCancellationEmail(adminEmail!, details);
  }, adminEmail);

  return count;
}

async function completeExpiredPaidBookings(db: Db, now: Date) {
  const items = await safeQuery(
    () => db.collection('bookings').find({ endDate: { $lte: now }, status: 'paid' }).toArray(),
    'Error fetching expired paid bookings:'
  );

  const updateResults = await Promise.allSettled(
    items.map(booking => 
      safeUpdate(
        () => db.collection('bookings').updateOne({ _id: booking._id }, { $set: { status: 'completed', completedAt: now, updatedAt: now } }),
        'Error completing booking:'
      )
    )
  );
  return updateResults.filter(r => r.status === 'fulfilled' && r.value === true).length;
}

async function sendSaleReminders(db: Db, adminEmail: string, sixDaysAgoStart: Date, sixDaysAgoEnd: Date) {
  const items = await safeQuery(
    () => db.collection('sales').find({ createdAt: { $gte: sixDaysAgoStart, $lt: sixDaysAgoEnd }, status: 'pending' }).toArray(),
    'Error fetching pending sales near deadline:'
  );

  return sendEmailsInParallel(items, async (sale) => {
    const equipment = await db.collection('equipment').findOne({ _id: new ObjectId(sale.equipmentId) });
    const buyer = await db.collection('users').findOne({ _id: new ObjectId(sale.buyerId) });
    const supplier = sale.supplierId ? await db.collection('users').findOne({ _id: new ObjectId(sale.supplierId) }) : null;
    
    const details: SaleEmailDetails = {
      referenceNumber: sale.referenceNumber,
      equipmentName: equipment?.name || 'Unknown',
      equipmentReference: equipment?.referenceNumber || '',
      salePrice: sale.salePrice,
      createdAt: sale.createdAt,
      buyerName: buyer ? `${buyer.firstName} ${buyer.lastName}` : 'Unknown',
      buyerPhone: buyer?.phone || 'N/A',
      supplierName: supplier ? `${supplier.firstName} ${supplier.lastName}` : 'Administration',
      supplierPhone: supplier?.phone || '-'
    };
    
    await sendSalePendingReminderEmail(adminEmail!, details);
  }, adminEmail);
}

async function cancelOldPendingSales(db: Db, adminEmail: string, now: Date, sevenDaysAgo: Date) {
  const items = await safeQuery(
    () => db.collection('sales').find({ createdAt: { $lte: sevenDaysAgo }, status: 'pending' }).toArray(),
    'Error fetching old pending sales:'
  );

  const updateResults = await Promise.allSettled(
    items.map(sale => 
      safeUpdate(
        () => db.collection('sales').updateOne({ _id: sale._id }, { $set: { status: 'cancelled', updatedAt: now } }),
        'Error cancelling sale:'
      )
    )
  );
  const count = updateResults.filter(r => r.status === 'fulfilled' && r.value === true).length;

  await sendEmailsInParallel(items, async (sale) => {
    const equipment = await db.collection('equipment').findOne({ _id: new ObjectId(sale.equipmentId) });
    const buyer = await db.collection('users').findOne({ _id: new ObjectId(sale.buyerId) });
    const supplier = sale.supplierId ? await db.collection('users').findOne({ _id: new ObjectId(sale.supplierId) }) : null;
    
    const details: SaleCancellationDetails = {
      referenceNumber: sale.referenceNumber,
      equipmentName: equipment?.name || 'Unknown',
      equipmentReference: equipment?.referenceNumber || '',
      salePrice: sale.salePrice,
      buyerName: buyer ? `${buyer.firstName} ${buyer.lastName}` : 'Unknown',
      buyerPhone: buyer?.phone || 'N/A',
      supplierName: supplier ? `${supplier.firstName} ${supplier.lastName}` : 'Administration',
      supplierPhone: supplier?.phone || '-',
      cancellationDate: now,
      createdAt: sale.createdAt
    };
    
    await sendSaleCancellationEmail(adminEmail!, details);
  }, adminEmail);

  return count;
}

export async function processAutoCompletion(db: Db) {
  const now = new Date();
  const adminEmail = process.env.ADMIN_EMAIL;
  
  if (!adminEmail) {
    console.error('ADMIN_EMAIL environment variable is not set');
    return {
      bookings: { completed: 0, cancelled: 0, reminders: 0, startReminders: 0 },
      sales: { cancelled: 0, reminders: 0 }
    };
  }
  
  const tomorrow = getDayRange(BOOKING_REMINDER_DAYS);
  const saleReminderDay = getDayRange(-SALE_REMINDER_DAYS);
  const saleCancelDate = getDayRange(-SALE_CANCEL_DAYS).start;

  const bookingsStartReminders = await sendBookingStartReminders(db, adminEmail, tomorrow.start, tomorrow.end);
  const bookingsReminders = await sendBookingEndReminders(db, adminEmail, tomorrow.start, tomorrow.end);
  const bookingsCancelled = await cancelExpiredPendingBookings(db, adminEmail, now);
  const bookingsCompleted = await completeExpiredPaidBookings(db, now);
  const salesReminders = await sendSaleReminders(db, adminEmail, saleReminderDay.start, saleReminderDay.end);
  const salesCancelled = await cancelOldPendingSales(db, adminEmail, now, saleCancelDate);

  return {
    bookings: { completed: bookingsCompleted, cancelled: bookingsCancelled, reminders: bookingsReminders, startReminders: bookingsStartReminders },
    sales: { cancelled: salesCancelled, reminders: salesReminders }
  };
}
