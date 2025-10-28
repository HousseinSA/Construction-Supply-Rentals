import { useState, useEffect, useCallback } from 'react'
import { Equipment as EquipmentModel } from '@/lib/models/equipment'

// Frontend version with string IDs instead of ObjectId
export type Equipment = Omit<EquipmentModel, '_id' | 'supplierId' | 'categoryId' | 'equipmentTypeId' | 'createdBy' | 'approvedBy'> & {
  _id: string
  supplierId?: string
  categoryId: string
  equipmentTypeId: string
  createdBy?: string
  approvedBy?: string
}

interface UseEquipmentParams {
  categoryId?: string
  city?: string
  availableOnly?: boolean
}

export function useEquipment(params: UseEquipmentParams = {}) {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEquipment = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const searchParams = new URLSearchParams()
      if (params.categoryId) searchParams.set('categoryId', params.categoryId)
      if (params.city) searchParams.set('city', params.city)
      if (params.availableOnly) searchParams.set('available', 'true')
      
      const response = await fetch(`/api/equipment?${searchParams}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch equipment')
      }
      
      const data = await response.json()
      setEquipment(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Failed to fetch equipment:', err)
    } finally {
      setLoading(false)
    }
  }, [params.categoryId, params.city, params.availableOnly])

  useEffect(() => {
    fetchEquipment()
  }, [fetchEquipment])

  return {
    equipment,
    loading,
    error,
    refetch: fetchEquipment
  }
}