import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import { connectDB } from '@/src/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const refNumber = searchParams.get('ref');

    if (!refNumber) {
      return NextResponse.json({ success: false, error: 'Reference number required' }, { status: 400 });
    }

    const db = await connectDB();

    const booking = await db.collection('bookings').findOne({ referenceNumber: refNumber });
    if (booking) {
      const renterInfo = await db.collection('users').findOne({ _id: new ObjectId(booking.renterId) });
      const equipmentIds = booking.bookingItems.map((item: any) => new ObjectId(item.equipmentId));
      const equipmentInfo = await db.collection('equipment').find({ _id: { $in: equipmentIds } }).toArray();
      const supplierIds = booking.bookingItems.map((item: any) => new ObjectId(item.supplierId)).filter(Boolean);
      const supplierInfo = await db.collection('users').find({ _id: { $in: supplierIds } }).toArray();
      const hasAdminCreatedEquipment = supplierInfo.some((s: any) => s.role === 'admin');

      const bookingItemsWithImages = booking.bookingItems.map((item: any) => {
        const equipment = equipmentInfo.find((eq: any) => eq._id.toString() === item.equipmentId.toString());
        return {
          ...item,
          equipmentImage: equipment?.images?.[0] || item.equipmentImage
        };
      });

      return NextResponse.json({
        success: true,
        type: 'booking',
        data: { ...booking, bookingItems: bookingItemsWithImages, renterInfo: [renterInfo], equipmentInfo, supplierInfo, hasAdminCreatedEquipment }
      });
    }

    const sale = await db.collection('sales').findOne({ referenceNumber: refNumber });
    if (sale) {
      const buyerInfo = await db.collection('users').findOne({ _id: new ObjectId(sale.buyerId) });
      const equipmentInfo = await db.collection('equipment').findOne({ _id: new ObjectId(sale.equipmentId) });
      const supplierInfo = sale.supplierId ? await db.collection('users').findOne({ _id: new ObjectId(sale.supplierId) }) : null;

      return NextResponse.json({
        success: true,
        type: 'sale',
        data: { ...sale, buyerInfo: [buyerInfo], equipmentInfo: [equipmentInfo], supplierInfo: supplierInfo ? [supplierInfo] : [] }
      });
    }

    const equipment = await db.collection('equipment').findOne({ referenceNumber: refNumber });
    if (equipment) {
      const supplierInfo = equipment.supplierId ? await db.collection('users').findOne({ _id: new ObjectId(equipment.supplierId) }) : null;

      return NextResponse.json({
        success: true,
        type: 'equipment',
        data: { ...equipment, supplierInfo: supplierInfo ? [supplierInfo] : [] }
      });
    }

    return NextResponse.json({ success: false, error: 'notFound' }, { status: 404 });
  } catch (error) {
    console.error('Search reference error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
