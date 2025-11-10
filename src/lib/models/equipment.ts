import { ObjectId } from "mongodb"
import { EquipmentStatus, UsageCategory, PricingType } from "../types"

export interface Equipment {
  _id?: ObjectId
  supplierId: ObjectId
  name: string // Custom name like "CAT 320D" or "Unit #5"
  description: string
  categoryId: ObjectId
  equipmentTypeId: ObjectId
  pricing: {
    type: PricingType
    hourlyRate?: number
    dailyRate?: number
    kmRate?: number
    tonRate?: number           // Price per ton for Camion benne
    salePrice?: number         // Price if equipment is for sale
  }
  location: string
  images: string[]
  specifications?: {
    weight?: string
    power?: string
    capacity?: string
    [key: string]: any
  }
  usage: {
    engineHours?: number        // For stationary equipment (excavators, cranes, etc.)
    kilometers?: number         // For transport equipment (trucks, mobile cranes, etc.)
    tonnageCapacity?: number    // For trucks - how much weight they can carry
    yearManufactured: number    // Manufacturing year
  }
  usageCategory: UsageCategory // Auto-determined by equipment category
  status: EquipmentStatus
  isAvailable: boolean
  listingType: 'forSale' | 'forRent' // Type of listing
  createdBy: ObjectId          // Who created this equipment (admin or supplier)
  approvedBy?: ObjectId        // Admin who approved (if created by supplier)
  approvedAt?: Date            // When it was approved
  createdAt: Date
  updatedAt: Date
}

// Helper function to determine usage category based on equipment type name
export function getUsageCategoryFromEquipmentType(equipmentTypeName: string): UsageCategory {
  const lowerName = equipmentTypeName.toLowerCase();
  
  // Transport equipment measured by kilometers
  if (lowerName.includes('porte-char') || 
      lowerName.includes('porte-engin') ||
      lowerName.includes('portechar') ||
      lowerName.includes('porteengin')) {
    return 'kilometers'
  }
  
  // Dump trucks measured by tonnage capacity
  if (lowerName.includes('camion benne') ||
      lowerName.includes('camionbenne') ||
      lowerName.includes('benne')) {
    return 'tonnage'
  }
  
  // All other equipment measured by engine hours
  return 'hours'
}

// Helper function to determine initial equipment status based on creator role
export function getInitialEquipmentStatus(creatorRole: string): EquipmentStatus {
  // If admin creates equipment, it's automatically approved
  if (creatorRole === 'admin') {
    return 'approved'
  }
  // If supplier creates equipment, it needs admin approval
  return 'pending'
}


