import { ObjectId } from "mongodb"

export interface Category {
  _id?: ObjectId
  name: string // Translation key like "categories.earthworks"
  slug: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy?: ObjectId
}

export interface EquipmentType {
  _id?: ObjectId
  name: string
  slug: string
  categoryId: ObjectId
  pricingType: 'hourly' | 'daily' | 'per_km' | 'per_ton'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}