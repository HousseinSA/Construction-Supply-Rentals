import { ObjectId } from "mongodb"
export interface SaleOrder {
  _id?: ObjectId
  referenceNumber?: string
  buyerId: ObjectId
  equipmentId: ObjectId
  supplierId?: ObjectId | null
  equipmentName: string
  salePrice: number
  commission: number
  grandTotal: number
  status: "pending" | "paid" | "cancelled"
  buyerMessage?: string
  adminNotes?: string
  adminHandledBy?: ObjectId
  adminHandledAt?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}
