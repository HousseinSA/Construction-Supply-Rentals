import { ObjectId } from 'mongodb';
import { NotificationType } from '../types';

export interface Notification {
  _id?: ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  targetUserId?: ObjectId;     // Specific user (optional)
  targetRole?: 'admin' | 'user'; // All users with this role (optional)
  relatedEntityId?: ObjectId;  // Related booking/equipment ID
  isRead: boolean;
  createdAt: Date;
}