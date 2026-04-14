import { useState, useEffect } from "react"
import { EquipmentType } from "@/src/lib/models"

interface EquipmentTypeWithCount extends EquipmentType {
  equipmentCount?: number
}

export function useEquipmentTypes(category: string) {
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentTypeWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEquipmentTypes = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(
          `/api/equipment-types?category=${category}`
        )
        const data = await response.json()
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch equipment types')
        }
        
        setEquipmentTypes(data.data || [])
      } catch (error) {
        console.error("Failed to fetch equipment types:", error)
        setError("Failed to fetch equipment types")
      } finally {
        setLoading(false)
      }
    }
    fetchEquipmentTypes()
  }, [category])

  return { equipmentTypes, loading, error }
}