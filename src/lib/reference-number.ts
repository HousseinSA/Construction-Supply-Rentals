import { connectDB } from './mongodb';

export async function generateReferenceNumber(type: 'booking' | 'sale'): Promise<string> {
  const db = await connectDB();
  const collection = type === 'booking' ? db.collection('bookings') : db.collection('sales');
  
  let referenceNumber: string;
  let exists = true;
  
  while (exists) {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    referenceNumber = randomNum.toString();
    const existing = await collection.findOne({ referenceNumber });
    exists = !!existing;
  }
  
  return referenceNumber!;
}
