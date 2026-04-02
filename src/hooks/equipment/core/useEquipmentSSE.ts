import { useEffect, useRef } from 'react'
import { useSSEConnection } from './useSSEConnection'
import { useEquipmentStore } from '@/src/stores/equipmentStore'
import type { SSEConnectionOptions } from './sse-types'

function extractId(data: any): string | undefined {
  if (!data._id) return undefined
  if (typeof data._id === 'string') return data._id
  if (data._id.$oid) return data._id.$oid
  if (typeof data._id === 'object' && data._id.toString) return data._id.toString()
  return undefined
}

function normalizeEquipmentData(data: any, id: string) {
  const normalized = { ...data }
  if (normalized._id && typeof normalized._id !== 'string') {
    normalized._id = id
  }
  return normalized
}

export function useEquipmentSSE(options: SSEConnectionOptions = {}) {
  const { enabled = true, onUpdate } = options
  const onUpdateRef = useRef(onUpdate)

  const { connected, error, addEventListener, removeEventListener } = useSSEConnection('/api/stream', {
    ...options,
    enabled,
  })

  useEffect(() => {
    onUpdateRef.current = onUpdate
  }, [onUpdate])

  const handlersRef = useRef({
    created: (data: any) => {
      const id = extractId(data)
      if (!id) return

      const state = useEquipmentStore.getState()
      const equipmentData = normalizeEquipmentData(data, id)
      state.addEquipment(equipmentData)

      if (data.status === 'approved' && data.isAvailable) {
        state.addToPublicCache(equipmentData)
      }
      onUpdateRef.current?.()
    },

    updated: (data: any) => {
      const id = extractId(data)
      if (!id) return

      const state = useEquipmentStore.getState()
      const updateData = normalizeEquipmentData(data, id)
      state.updateEquipment(id, updateData)
      state.updatePublicCache(id, updateData)
      
      if (data.status === 'rejected' || !data.isAvailable) {
        state.removeFromPublicCache(id)
      }
      onUpdateRef.current?.()
    },

    approved: (data: any) => {
      if (!data.id) return
      const state = useEquipmentStore.getState()

      state.updateEquipment(data.id, { status: 'approved' })
      state.updatePublicCache(data.id, { status: 'approved' })
      onUpdateRef.current?.()
    },

    rejected: (data: any) => {
      if (!data.id) return
      const state = useEquipmentStore.getState()

      state.updateEquipment(data.id, { status: 'rejected', rejectionReason: data.reason })
      state.removeFromPublicCache(data.id)
      onUpdateRef.current?.()
    },

    sold: (data: any) => {
      if (!data.id) return
      const state = useEquipmentStore.getState()

      state.updateEquipment(data.id, { isSold: true, isAvailable: false })
      state.removeFromPublicCache(data.id)
      onUpdateRef.current?.()
    },

    booked: (data: any) => {
      if (!data.id) return
      const state = useEquipmentStore.getState()

      state.updateEquipment(data.id, { isAvailable: data.available })
      state.updatePublicCache(data.id, { isAvailable: data.available })
      onUpdateRef.current?.()
    },
  })

  useEffect(() => {
    if (!connected) return

    const h = handlersRef.current
    const events = [
      ['equipment.created', h.created],
      ['equipment.updated', h.updated],
      ['equipment.approved', h.approved],
      ['equipment.rejected', h.rejected],
      ['equipment.sold', h.sold],
      ['equipment.booked', h.booked],
    ] as const

    events.forEach(([event, handler]) => addEventListener(event, handler))
    return () => events.forEach(([event, handler]) => removeEventListener(event, handler))
  }, [connected, addEventListener, removeEventListener])

  return {
    connected,
    error,
  }
}
