import { useState, useEffect, useCallback } from "react"
import { usePolling } from "./usePolling"

interface Pricing {
  dailyRate?: number
  hourlyRate?: number
  kmRate?: number
}

interface Equipment {
  _id: string
  name: string
  description: string
  location: string
  pricing: Pricing
}

export function useEquipment(
  selectedCity?: string | null,
  selectedType?: string | null,
  listingType?: string | null,
) {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEquipment = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      params.set("available", "true")
      params.set("limit", "100")
      if (selectedCity && listingType !== "forSale") {
        params.set("city", selectedCity)
        params.set("listingType", "forRent")
      }
      if (selectedType) {
        params.set("type", selectedType)
      }
      if (listingType) {
        params.set("listingType", listingType)
      }
      const response = await fetch(`/api/equipment?${params.toString()}`)
      const data = await response.json()
      setEquipment(data.data || [])
    } catch (error) {
      console.error("Failed to fetch equipment:", error)
      setError("Failed to fetch equipment")
    } finally {
      setLoading(false)
    }
  }, [selectedCity, selectedType, listingType])

  useEffect(() => {
    fetchEquipment()
  }, [fetchEquipment])

  usePolling(fetchEquipment, { interval: 30000 })

  return { equipment, loading, error }
}
