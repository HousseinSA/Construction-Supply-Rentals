import { ObjectId } from 'mongodb';
import { EquipmentStatus } from '../types';

export interface Category {
  _id?: ObjectId;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: ObjectId; // Admin ID
}

export interface Equipment {
  _id?: ObjectId;
  supplierId: ObjectId;
  name: string;
  description: string;
  categoryId: ObjectId;
  dailyPrice: number;
  minRentalDays: number; // Minimum rental period (default: 1)
  maxRentalDays: number; // Maximum rental period (default: 365)
  city: string;
  images: string[]; // Cloudinary URLs
  status: EquipmentStatus;
  isAvailable: boolean; // Separate from approval status
  createdAt: Date;
  updatedAt: Date;
}