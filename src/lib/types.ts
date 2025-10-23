import { ObjectId } from 'mongodb';

// User Types
export type UserRole = 'admin' | 'user';
export type UserType = 'renter' | 'supplier';
export type UserStatus = 'approved' | 'blocked';

// Equipment Types
export type EquipmentStatus = 'pending' | 'approved' | 'rejected';
export type UsageCategory = 'hours' | 'kilometers' | 'tonnage';

// Booking Types
export type BookingStatus = 'pending' | 'admin_handling' | 'completed' | 'cancelled';

// Payment handled offline by admin - no payment types needed



// Collection Names
export const COLLECTIONS = {
  USERS: 'users',
  CATEGORIES: 'categories',
  EQUIPMENT_TYPES: 'equipmentTypes',
  EQUIPMENT: 'equipment',
  BOOKINGS: 'bookings',
  NOTIFICATIONS: 'notifications',
  ADMIN_SETTINGS: 'admin_settings',
  USER_SETTINGS: 'user_settings',
  PASSWORD_RESETS: 'password_resets',
} as const;