import { useEffect, useState, useCallback, useRef } from "react"
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
  const [transportEquipment, setTransportEquipment] = useState<Equipment[]>([])
  
  const [loading, setLoading] = useState(true)
  const [mainEquipment, setMainEquipment] = useState<Equipment | null>(null)
  const [mainLoading, setMainLoading] = useState(false)

  const [relatedOffset, setRelatedOffset] = useState(0)
  const [transportOffset, setTransportOffset] = useState(0)

  const [relatedHasMore, setRelatedHasMore] = useState(true)
  const [transportHasMore, setTransportHasMore] = useState(true)

  const [relatedLoadingMore, setRelatedLoadingMore] = useState(false)
  const [transportLoadingMore, setTransportLoadingMore] = useState(false)

  const needsTransport = equipmentName ? requiresTransport(equipmentName) : false
  const storedEquipment = useBookingSuccessStore((state) => state.equipment)
  const clearEquipment = useBookingSuccessStore((state) => state.clearEquipment)
  const hasFetchedMain = useRef(false)

  const fetchMainEquipment = useCallback(async () => {
    if (!equipmentId || hasFetchedMain.current) return

    if (storedEquipment) {
      setMainEquipment(storedEquipment)
      hasFetchedMain.current = true
      return
    }

    try {
      setMainLoading(true)
      const res = await fetch(`/api/equipment/${equipmentId}`)
      const data = await res.json()
      if (data.success) {
        setMainEquipment(data.data)
        hasFetchedMain.current = true
      }
    } catch (err) {
      console.error("Failed to fetch equipment:", err)
    } finally {
      setMainLoading(false)
    }
  }, [equipmentId, storedEquipment])

  const fetchAllSuggestions = useCallback(
    async (
      relatedOff = 0,
      transportOff = 0,
      isLoadMore = false
    ) => {
      if (!equipmentId) return

      try {
        if (isLoadMore) {
          if (relatedOff > 0) setRelatedLoadingMore(true)
          if (transportOff > 0) setTransportLoadingMore(true)
        }

        const response = await fetch(
          `/api/equipment/suggestions?` +
            `equipmentId=${equipmentId}&` +
            `needsTransport=${needsTransport}&` +
            `relatedOffset=${relatedOff}&` +
            `transportOffset=${transportOff}`
        )

        const data = await response.json()

        if (data.success) {
          if (relatedOff === 0 && transportOff === 0) {
            setRelatedEquipment(data.related.equipment)
            setTransportEquipment(data.transport.equipment)
          } else {
            if (relatedOff > 0) {
              setRelatedEquipment((prev) => [...prev, ...data.related.equipment])
            }
            if (transportOff > 0) {
              setTransportEquipment((prev) => [...prev, ...data.transport.equipment])
            }
          }

          setRelatedHasMore(data.related.hasMore)
          setTransportHasMore(data.transport.hasMore)
        }
      } catch (error) {
        console.error("Failed to fetch equipment suggestions:", error)
      } finally {
        setLoading(false)
        setRelatedLoadingMore(false)
        setTransportLoadingMore(false)
      }
    },
    [equipmentId, needsTransport]
  )

  const loadMoreRelated = useCallback(() => {
    if (!relatedLoadingMore && relatedHasMore) {
      const newOffset = relatedOffset + 12
      setRelatedOffset(newOffset)
      fetchAllSuggestions(newOffset, 0, true)
    }
  }, [relatedLoadingMore, relatedHasMore, relatedOffset, fetchAllSuggestions])

  const loadMoreTransport = useCallback(() => {
    if (!transportLoadingMore && transportHasMore) {
      const newOffset = transportOffset + 12
      setTransportOffset(newOffset)
      fetchAllSuggestions(0, newOffset, true)
    }
  }, [transportLoadingMore, transportHasMore, transportOffset, fetchAllSuggestions])

  useEffect(() => {
    fetchAllSuggestions(0, 0, false)
  }, [equipmentId, needsTransport])

  useEffect(() => {
    if (storedEquipment) {
      setMainEquipment(storedEquipment)
      hasFetchedMain.current = true
    } else if (!hasFetchedMain.current) {
      fetchMainEquipment()
    }
  }, [storedEquipment, fetchMainEquipment])

  useEffect(() => {
    if (mainEquipment && !loading) {
      const timer = setTimeout(() => {
        clearEquipment()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [mainEquipment, loading, clearEquipment])

  return {
    equipmentName,
    equipmentId,
    type,
    mainEquipment,
    mainLoading,
    needsTransport,
    
    relatedEquipment,
    relatedHasMore,
    relatedLoadingMore,
    loadMoreRelated,
    
    transportEquipment,
    transportHasMore,
    transportLoadingMore,
    loadMoreTransport,
  }
}
