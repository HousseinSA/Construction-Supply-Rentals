export type UserRole = "admin" | "user"
export type UserType = "renter" | "supplier"
export type UserStatus = "approved" | "blocked"

export type { User } from "./models/user"

export type EquipmentStatus = "pending" | "approved" | "rejected" | "disabled" | "sold" | "retired"
export type UsageCategory = "hours" | "kilometers" | "tonnage"
export type PricingType = "hourly" | "daily" | "monthly" | "per_km" | "per_ton"

export type BookingStatus = "pending" | "paid" | "completed" | "cancelled"

export type NotificationType =
  | "new_booking"
  | "new_equipment"
  | "booking_status_change"
  | "equipment_approved"


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
