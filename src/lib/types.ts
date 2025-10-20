import { ObjectId } from 'mongodb';

// User Types
export type UserRole = 'admin' | 'user';
export type UserType = 'renter' | 'supplier';
export type UserStatus = 'approved' | 'blocked';

// Equipment Types
export type EquipmentStatus = 'pending' | 'approved' | 'rejected';

// Booking Types
export type BookingStatus = 'pending' | 'admin_approved' | 'rejected' | 'completed';

// Payment Types
export type PaymentMethod = 'cash' | 'mobile_money';
export type PaymentStatus = 'pending' | 'confirmed';

// Notification Types
export type NotificationType = 'new_booking' | 'new_equipment' | 'payment_submitted' | 'new_supplier';

// Collection Names
export const COLLECTIONS = {
  USERS: 'users',
  CATEGORIES: 'categories',
  EQUIPMENT: 'equipment',
  BOOKINGS: 'bookings',
  PAYMENTS: 'payments',
  NOTIFICATIONS: 'notifications',
  ADMIN_SETTINGS: 'admin_settings',
  PASSWORD_RESETS: 'password_resets',
} as const;