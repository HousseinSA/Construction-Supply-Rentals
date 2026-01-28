export interface PersonInfo {
  name: string
  phone: string
}

export interface SupplierInfo extends PersonInfo {
  isAdmin?: boolean
}

export interface BookingEmailDetails {
  referenceNumber: string
  equipmentNames: string[]
  equipmentReferences?: string[]
  totalPrice: number
  renterName: string
  renterPhone: string
  suppliers: PersonInfo[]
  createdAt: Date
}

export interface BookingStartReminderDetails extends BookingEmailDetails {
  startDate: Date
  endDate: Date
  status: string
}

export interface BookingCancellationDetails extends BookingEmailDetails {
  renterLocation?: string
  cancellationDate: Date
  suppliers: Array<PersonInfo & { equipment: string; duration: string; equipmentRef?: string }>
}

export interface SaleEmailDetails {
  referenceNumber: string
  equipmentName: string
  equipmentReference?: string
  salePrice: number
  buyerName: string
  buyerPhone: string
  supplierName: string
  supplierPhone: string
  createdAt: Date
}

export interface SaleCancellationDetails extends SaleEmailDetails {
  cancellationDate: Date
}

export interface NewBookingDetails {
  referenceNumber: string
  equipmentName: string
  equipmentReference?: string
  totalPrice: number
  commission: number
  renterName: string
  renterPhone: string
  supplierName: string
  supplierPhone: string
  usage: number
  usageUnit: string
  rate: number
  startDate?: Date
  endDate?: Date
  bookingDate: Date
}

export interface NewSaleDetails {
  referenceNumber: string
  equipmentName: string
  equipmentReference?: string
  salePrice: number
  commission: number
  buyerName: string
  buyerPhone: string
  supplierName: string
  supplierPhone: string
  saleDate: Date
}

export interface NewEquipmentDetails {
  equipmentName: string
  supplierName: string
  supplierPhone: string
  location: string
  category?: string
  listingType: string
  pricing: string
  dateSubmitted: Date
}

export interface PricingUpdateDetails {
  equipmentName: string
  equipmentReference: string
  supplierName: string
  supplierPhone: string
  currentPricing: string
  requestedPricing: string
  requestDate: Date
}

export interface EmailButton {
  text: string
  url: string
}

export interface EmailAlert {
  message: string
  color: "red" | "yellow" | "blue"
}

export interface EmailSection {
  title: string
  rows: Array<{ label: string; value: string }>
}