import { ObjectId } from 'mongodb';
import { NotificationType } from '../types';

export interface Notification {
  _id?: ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: ObjectId; // Related booking/equipment/payment/user ID
  createdAt: Date;
}

export interface AdminSettings {
  _id?: ObjectId;
  commissionRate: number; // Percentage
  supportPhone?: string;
  supportEmail?: string;
  updatedAt: Date;
  updatedBy: ObjectId; // Admin ID
}