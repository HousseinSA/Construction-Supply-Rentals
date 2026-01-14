import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/src/lib/auth';
import { connectDB } from '@/src/lib/mongodb';
import { processAutoCompletion } from '@/src/lib/auto-complete';

export async function POST(req: NextRequest) {
  try {
    console.log('[CRON] Auto-complete triggered at:', new Date().toISOString());
    
    // Check both header and query parameter for token
    const authHeader = req.headers.get('authorization');
    const headerToken = authHeader?.replace('Bearer ', '');
    const queryToken = req.nextUrl.searchParams.get('token');
    const token = headerToken || queryToken;
    const envSecret = process.env.AUTO_COMPLETE_SECRET;
    
    console.log('[CRON] Header token received:', headerToken ? 'YES' : 'NO');
    console.log('[CRON] Query token received:', queryToken ? 'YES' : 'NO');
    console.log('[CRON] Env secret exists:', envSecret ? 'YES' : 'NO');
    console.log('[CRON] Token matches:', token === envSecret);
    
    const isValidCron = token === envSecret;

    if (!isValidCron) {
      console.log('[CRON] Invalid token, checking admin session');
      const session = await getServerSession(authOptions);
      if (!session || session.user?.role !== 'admin') {
        console.log('[CRON] Unauthorized access attempt');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    console.log('[CRON] Starting auto-completion process');
    const db = await connectDB();
    const result = await processAutoCompletion(db);
    
    console.log('[CRON] Completed:', JSON.stringify(result));

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
    console.error('[CRON] Auto-completion error:', error);
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Debug endpoint - remove after testing
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  const envSecret = process.env.AUTO_COMPLETE_SECRET;
  
  return NextResponse.json({
    status: 'ready',
    endpoint: '/api/cron/auto-complete',
    message: 'Send POST to trigger manually',
    debug: {
      hasAuthHeader: !!authHeader,
      hasToken: !!token,
      hasEnvSecret: !!envSecret,
      tokenLength: token?.length || 0,
      envSecretLength: envSecret?.length || 0,
      tokensMatch: token === envSecret
    }
  });
}
