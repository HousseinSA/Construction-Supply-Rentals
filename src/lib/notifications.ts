import { connectDB } from './mongodb';
import { ObjectId } from 'mongodb';
import { NotificationType } from './types';

// Create notification for admin only
export async function createNotification(
  type: NotificationType,
  title: string,
  message: string,
  relatedEntityId?: ObjectId
) {
  try {
    const db = await connectDB();
    
    const notification = {
      type,
      title,
      message,
      targetRole: 'admin' as const, // Only admin gets notifications for now
      relatedEntityId,
      isRead: false,
      createdAt: new Date()
    };

    const result = await db.collection('notifications').insertOne(notification);
    return result.insertedId;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}

// Get all notifications for admin
export async function getAdminNotifications() {
  try {
    const db = await connectDB();
    
    const notifications = await db.collection('notifications')
      .find({ targetRole: 'admin' })
      .sort({ createdAt: -1 })
      .toArray();
      
    return notifications;
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: ObjectId) {
  try {
    const db = await connectDB();
    
    await db.collection('notifications').updateOne(
      { _id: notificationId },
      { $set: { isRead: true } }
    );
    
    return true;
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return false;
  }
}