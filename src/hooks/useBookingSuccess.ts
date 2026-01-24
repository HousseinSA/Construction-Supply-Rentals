import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { requiresTransport } from "@/src/lib/constants/transport"
import { useBookingSuccessStore } from "@/src/stores/bookingSuccessStore"
import { Equipment } from "@/src/lib/models"

export function useBookingSuccess() {
  const searchParams = useSearchParams()
  const equipmentName = searchParams.get("equipment")
  const equipmentId = searchParams.get("equipmentId")
  const type = searchParams.get("type") || "booking"
  
  const [relatedEquipment, setRelatedEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [mainEquipment, setMainEquipment] = useState<Equipment | null>(null)
  const [mainLoading, setMainLoading] = useState(false)
  
  const needsTransport = equipmentName ? requiresTransport(equipmentName) : false
  const storedEquipment = useBookingSuccessStore((state) => state.equipment)
  const clearEquipment = useBookingSuccessStore((state) => state.clearEquipment)

  const fetchMainEquipment = useCallback(async () => {
    if (!equipmentId) return
    if (storedEquipment) {
      setMainEquipment(storedEquipment)
      return
    }
    try {
      setMainLoading(true)
      const res = await fetch(`/api/equipment/${equipmentId}`)
      const data = await res.json()
      if (data.success) setMainEquipment(data.data)
    } catch (err) {
      console.error('Failed to fetch equipment:', err)
    } finally {
      setMainLoading(false)
    }
  }, [equipmentId, storedEquipment])

  const fetchRelatedEquipment = useCallback(async () => {
    try {
      if (needsTransport) {
        const response = await fetch("/api/equipment/available-transport")
        const data = await response.json()
        if (data.success) {
          setRelatedEquipment(data.equipment || [])
        }
      } else if (equipmentId) {
        const response = await fetch(`/api/equipment/related?id=${equipmentId}&limit=6&type=${type}`)
        const data = await response.json()
        if (data.success) {
          setRelatedEquipment(data.equipment || [])
        }
      } else {
        const response = await fetch("/api/equipment?limit=6")
        const data = await response.json()
        if (data.success) {
          setRelatedEquipment(data.data || [])
        }
      }
    } catch (error) {
      console.error("Failed to fetch equipment:", error)
      setRelatedEquipment([])
    } finally {
      setLoading(false)
    }
  }, [equipmentId, needsTransport, type])

  useEffect(() => {
    fetchRelatedEquipment()
    fetchMainEquipment()
  }, [fetchRelatedEquipment, fetchMainEquipment])

  useEffect(() => {
    if (mainEquipment && relatedEquipment.length > 0 && !loading) {
      const timer = setTimeout(() => {
        clearEquipment()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [mainEquipment, relatedEquipment, loading, clearEquipment])

  return {
    equipmentName,
    equipmentId,
    type,
    relatedEquipment,
    loading,
    mainEquipment,
    mainLoading,
    needsTransport
  }
}
