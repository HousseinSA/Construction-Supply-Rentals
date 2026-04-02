export const SSE_CHANNELS = {
  EQUIPMENT_PUBLIC: 'equipment.public',
  EQUIPMENT_SUPPLIER: (id: string) => `equipment.supplier.${id}`,
  EQUIPMENT_ADMIN: 'equipment.admin',
  
  BOOKINGS_USER: (id: string) => `bookings.user.${id}`,
  BOOKINGS_ADMIN: 'bookings.admin',
  
  SALES_PUBLIC: 'sales.public',
  SALES_USER: (id: string) => `sales.user.${id}`,
} as const

export type SSEChannel = string
