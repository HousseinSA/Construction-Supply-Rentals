import { ObjectId } from 'mongodb';

export interface TransportDetails {
  porteCharId: ObjectId;
  porteCharName: string;
  supplierId?: ObjectId | null;
  supplierName?: string;
  distance: number;
  ratePerKm: number;
  transportCost: number;
}

export interface SaleOrder {
  _id?: ObjectId;
  referenceNumber?: string;
  buyerId: ObjectId;
  equipmentId: ObjectId;
  supplierId?: ObjectId | null;
  equipmentName: string;
  salePrice: number;
  commission: number;
  transportDetails?: TransportDetails;
  grandTotal: number;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  buyerMessage?: string;
  adminNotes?: string;
  adminHandledBy?: ObjectId;
  adminHandledAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
