import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/src/lib/auth';
import { connectDB } from '@/src/lib/mongodb';
import { processAutoCompletion } from '@/src/lib/auto-complete';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const isValidCron = token === process.env.AUTO_COMPLETE_SECRET;

    if (!isValidCron) {
      const session = await getServerSession(authOptions);
      if (!session || session.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const db = await connectDB();
    const result = await processAutoCompletion(db);

    return NextResponse.json({
      success: true,
      result: {
        bookings: {
          completed: result.bookings.completed,
          cancelled: result.bookings.cancelled,
          reminders: result.bookings.reminders
        },
        sales: {
          cancelled: result.sales.cancelled,
          reminders: result.sales.reminders
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Auto-completion error:', error);
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    status: 'ready',
    endpoint: '/api/cron/auto-complete',
    message: 'Send POST to trigger manually'
  });
}
