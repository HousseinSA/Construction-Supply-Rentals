import { Db, ObjectId, WithId, Document } from 'mongodb';
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
import { formatPhoneNumber } from './format';

type Booking = WithId<Document>;
type Sale = WithId<Document>;

// Configuration constants
const SALE_REMINDER_DAYS = 6;  // Send reminder when sale is 6 days old
const SALE_CANCEL_DAYS = 7;    // Cancel sale when 7 days old
const BOOKING_REMINDER_DAYS = 1; // Send reminder 1 day before

// Helper to get start/end of a specific day offset from now
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

async function sendBookingStartReminders(db: Db, adminEmail: string, tomorrowStart: Date, tomorrowEnd: Date) {
  const items = await safeQuery(
    () => db.collection('bookings').find({ startDate: { $gte: tomorrowStart, $lt: tomorrowEnd }, status: { $in: ['pending', 'paid'] } }).toArray(),
    'Error fetching bookings starting soon:'
  );

  let count = 0;
  for (const booking of items) {
    try {
      if (!adminEmail) continue;
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
      
      await sendBookingStartReminderEmail(adminEmail, details);
      count++;
    } catch (err) {
      console.error('Booking start reminder email error:', err);
    }
  }
  return count;
}

async function sendBookingEndReminders(db: Db, adminEmail: string, tomorrowStart: Date, tomorrowEnd: Date) {
  const items = await safeQuery(
    () => db.collection('bookings').find({ endDate: { $gte: tomorrowStart, $lt: tomorrowEnd }, status: 'pending' }).toArray(),
    'Error fetching pending bookings near end:'
  );

  let count = 0;
  for (const booking of items) {
    try {
      if (!adminEmail) continue;
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
      
      await sendBookingPendingReminderEmail(adminEmail, details);
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
        suppliers: suppliers.filter(s => s !== null),
        createdAt: booking.createdAt,
        cancellationDate: now
      };

      await sendBookingCancellationEmail(adminEmail, details);
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

async function sendSaleReminders(db: Db, adminEmail: string, sixDaysAgoStart: Date, sixDaysAgoEnd: Date) {
  const items = await safeQuery(
    () => db.collection('sales').find({ createdAt: { $gte: sixDaysAgoStart, $lt: sixDaysAgoEnd }, status: 'pending' }).toArray(),
    'Error fetching pending sales near deadline:'
  );

  let count = 0;
  for (const sale of items) {
    try {
      if (!adminEmail) continue;
      const equipment = await db.collection('equipment').findOne({ _id: new ObjectId(sale.equipmentId) });
      const buyer = await db.collection('users').findOne({ _id: new ObjectId(sale.buyerId) });
      const supplier = sale.supplierId ? await db.collection('users').findOne({ _id: new ObjectId(sale.supplierId) }) : null;
      
      const details: SaleEmailDetails = {
        referenceNumber: sale.referenceNumber,
        equipmentName: equipment?.name || 'Unknown',
        equipmentReference: equipment?.referenceNumber,
        salePrice: sale.salePrice,
        createdAt: sale.createdAt,
        buyerName: buyer ? `${buyer.firstName} ${buyer.lastName}` : 'Unknown',
        buyerPhone: buyer?.phone || 'N/A',
        supplierName: supplier ? `${supplier.firstName} ${supplier.lastName}` : 'Administration',
        supplierPhone: supplier?.phone || '-'
      };
      
      await sendSalePendingReminderEmail(adminEmail, details);
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
      const equipment = await db.collection('equipment').findOne({ _id: new ObjectId(sale.equipmentId) });
      const buyer = await db.collection('users').findOne({ _id: new ObjectId(sale.buyerId) });
      const supplier = sale.supplierId ? await db.collection('users').findOne({ _id: new ObjectId(sale.supplierId) }) : null;
      
      const details: SaleCancellationDetails = {
        referenceNumber: sale.referenceNumber,
        equipmentName: equipment?.name || 'Unknown',
        equipmentReference: equipment?.referenceNumber,
        salePrice: sale.salePrice,
        buyerName: buyer ? `${buyer.firstName} ${buyer.lastName}` : 'Unknown',
        buyerPhone: buyer?.phone || 'N/A',
        supplierName: supplier ? `${supplier.firstName} ${supplier.lastName}` : 'Administration',
        supplierPhone: supplier?.phone || '-',
        cancellationDate: now,
        createdAt: sale.createdAt
      };
      
      await sendSaleCancellationEmail(adminEmail, details);
    } catch (err) {
      console.error('Sale cancellation email error:', err);
    }
  }
  return count;
}

export async function processAutoCompletion(db: Db) {
  const now = new Date();
  const adminEmail = process.env.ADMIN_EMAIL || '';
  
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
