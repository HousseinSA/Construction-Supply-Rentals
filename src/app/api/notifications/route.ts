import { NextRequest, NextResponse } from 'next/server';
import { getAdminNotifications, markNotificationAsRead } from '@/lib/notifications';
import { ObjectId } from 'mongodb';

// GET /api/notifications - Get all admin notifications
export async function GET() {
  try {
    const notifications = await getAdminNotifications();
    
    return NextResponse.json({
      success: true,
      data: notifications,
      count: notifications.length
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch notifications'
    }, { status: 500 });
  }
}

// PUT /api/notifications - Mark notification as read
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json({
        success: false,
        error: 'Missing notificationId'
      }, { status: 400 });
    }

    const success = await markNotificationAsRead(new ObjectId(notificationId));
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Notification marked as read'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to mark notification as read'
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to update notification'
    }, { status: 500 });
  }
}