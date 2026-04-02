import type { Equipment } from '../models/equipment'

export type EquipmentSSEEvent = 
  | { type: 'equipment.created'; data: Equipment }
  | { type: 'equipment.updated'; data: Equipment }
  | { type: 'equipment.approved'; data: { id: string; supplierId: string } }
  | { type: 'equipment.rejected'; data: { id: string; supplierId: string; reason: string } }
  | { type: 'equipment.sold'; data: { id: string } }
  | { type: 'equipment.booked'; data: { id: string; available: boolean } }

export type BookingSSEEvent = 
  | { type: 'booking.created'; data: any }
  | { type: 'booking.confirmed'; data: any }
  | { type: 'booking.cancelled'; data: any }
  | { type: 'booking.completed'; data: any }

export type SaleSSEEvent = 
  | { type: 'sale.created'; data: any }
  | { type: 'sale.completed'; data: any }

export type SSEEvent = EquipmentSSEEvent | BookingSSEEvent | SaleSSEEvent

export interface SSEMessage {
  id: string
  event: string
  data: string
}
