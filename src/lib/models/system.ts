import { ObjectId } from 'mongodb';

export interface AdminSettings {
  _id?: ObjectId;
  canManageCategories: boolean;
  canManageEquipmentTypes: boolean;
  canApproveEquipment: boolean;
  canManageUsers: boolean;
  canViewReports: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  _id?: ObjectId;
  userId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}