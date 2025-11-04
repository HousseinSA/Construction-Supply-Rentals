// User Types
export type UserRole = "admin" | "user"
export type UserType = "renter" | "supplier"
export type UserStatus = "approved" | "blocked"

// Equipment Types
export type EquipmentStatus = "pending" | "approved" | "rejected"
export type UsageCategory = "hours" | "kilometers" | "tonnage"
export type PricingType = "hourly" | "daily" | "per_km" | "per_ton"

// Booking Types
export type BookingStatus = "pending" | "paid" | "completed" | "cancelled"

// Notification Types
export type NotificationType =
  | "new_booking"
  | "new_equipment"
  | "booking_status_change"
  | "equipment_approved"

// Payment handled offline by admin - no payment types needed

// Collection Names
export const COLLECTIONS = {
  USERS: "users",
  CATEGORIES: "categories",
  EQUIPMENT_TYPES: "equipmentTypes",
  EQUIPMENT: "equipment",
  BOOKINGS: "bookings",
  NOTIFICATIONS: "notifications",
  ADMIN_SETTINGS: "admin_settings",
  USER_SETTINGS: "user_settings",
  PASSWORD_RESETS: "password_resets",
} as const
