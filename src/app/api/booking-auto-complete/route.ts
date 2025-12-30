import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/src/lib/auth';
import { connectDB } from '@/src/lib/mongodb';
import { processBookingAutoCompletion } from '@/src/lib/booking-auto-complete';

// GET: Check job status or trigger manually
// POST: Trigger booking auto-completion job
export async function POST(req: NextRequest) {
  try {
    // Check authentication - only admin can trigger this
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - admin access required' },
        { status: 401 }
      );
    }

    // Verify the request has the correct secret if provided
    const secret = req.headers.get('x-auto-complete-secret');
    if (process.env.AUTO_COMPLETE_SECRET && secret !== process.env.AUTO_COMPLETE_SECRET) {
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 403 }
      );
    }

    const db = await connectDB();
    const result = await processBookingAutoCompletion(db);

    return NextResponse.json({
      success: true,
      message: 'Booking auto-completion job completed',
      result: {
        completed: result.completed,
        cancelled: result.cancelled,
        reminders: result.reminders,
        totalProcessed: result.completed + result.cancelled,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Booking auto-completion error:', error);
    return NextResponse.json(
      { error: 'Failed to process auto-completion' },
      { status: 500 }
    );
  }
}

// GET: Optional health check endpoint
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      status: 'ready',
      message: 'Auto-completion job endpoint is ready. Send POST to trigger.',
      endpoint: '/api/booking-auto-complete'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Service unavailable' },
      { status: 503 }
    );
  }
}
