import { ObjectId } from 'mongodb'

export interface EquipmentId {
  _id: string | ObjectId | { $oid: string } | { toString: () => string }
}

export interface EquipmentCreatedData extends EquipmentId {
  status?: string
  isAvailable?: boolean
  [key: string]: any
}

export interface EquipmentUpdatedData extends EquipmentId {
  status?: string
  isAvailable?: boolean
  [key: string]: any
}

export interface EquipmentStatusData {
  id: string
  supplierId?: string
  reason?: string
  available?: boolean
}

export type EquipmentSSEEvent = 
  | { type: 'equipment.created'; data: EquipmentCreatedData }
  | { type: 'equipment.updated'; data: EquipmentUpdatedData }
  | { type: 'equipment.approved'; data: EquipmentStatusData }
  | { type: 'equipment.rejected'; data: EquipmentStatusData }
  | { type: 'equipment.sold'; data: EquipmentStatusData }
  | { type: 'equipment.booked'; data: EquipmentStatusData }

export type SSEEventType = EquipmentSSEEvent['type']

export type SSEEventHandler<T = any> = (data: T) => void

export interface SSEConnectionOptions {
  enabled?: boolean
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: string) => void
  onUpdate?: () => void
}
