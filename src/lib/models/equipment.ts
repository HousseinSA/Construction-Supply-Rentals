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
  city: string;
  images: string[]; // Cloudinary URLs
  status: EquipmentStatus;
  createdAt: Date;
  updatedAt: Date;
}