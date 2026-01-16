import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/src/lib/auth';
import { connectDB } from '@/src/lib/mongodb';
import { processAutoCompletion } from '@/src/lib/auto-complete';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const headerToken = authHeader?.replace('Bearer ', '');
    const queryToken = req.nextUrl.searchParams.get('token');
    const token = headerToken || queryToken;
    const envSecret = process.env.AUTO_COMPLETE_SECRET;
    
    const isValidCron = token === envSecret;

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
          reminders: result.bookings.reminders,
          startReminders: result.bookings.startReminders
        },
        sales: {
          cancelled: result.sales.cancelled,
          reminders: result.sales.reminders
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[CRON] Auto-completion error:', error);
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
