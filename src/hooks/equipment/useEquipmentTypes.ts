import { useState, useEffect, useCallback } from "react"
import { EquipmentType } from "@/src/lib/models"

interface EquipmentTypeWithCount extends EquipmentType {
  equipmentCount?: number
}

export function useEquipmentTypes(category: string) {
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentTypeWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<boolean>(false)

  const fetchEquipmentTypes = useCallback(async () => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    try {
      setLoading(true)
      setError(false)
      const response = await fetch(
        `/api/equipment-types?category=${category}`,
        {
          signal: controller.signal
        }
      )
      
      clearTimeout(timeoutId)
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch equipment types')
      }
      
      setEquipmentTypes(data.data || [])
    } catch (error) {
      clearTimeout(timeoutId)
      console.error("Failed to fetch equipment types:", error)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    fetchEquipmentTypes()
  }, [fetchEquipmentTypes])

  return { equipmentTypes, loading, error, refetch: fetchEquipmentTypes }
}