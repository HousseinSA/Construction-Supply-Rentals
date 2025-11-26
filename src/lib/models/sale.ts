import { ObjectId } from 'mongodb';

export interface SaleOrder {
  _id?: ObjectId;
  buyerId: ObjectId;
  equipmentId: ObjectId;
  supplierId?: ObjectId | null;
  equipmentName: string;
  salePrice: number;
  commission: number; // 5% fixed
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  buyerMessage?: string;
  adminNotes?: string;
  adminHandledBy?: ObjectId;
  adminHandledAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
