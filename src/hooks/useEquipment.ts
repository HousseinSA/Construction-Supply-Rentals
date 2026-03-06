import { useState, useEffect, useCallback, useRef } from "react"
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
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialMount, setIsInitialMount] = useState(true)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchEquipment = useCallback(async (pageNum: number, append = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const params = new URLSearchParams()
      params.set("available", "true")
      params.set("page", pageNum.toString())
      params.set("limit", "10")

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

      const response = await fetch(`/api/equipment?${params.toString()}`, {
        signal: abortControllerRef.current.signal,
      })
      const data = await response.json()

      if (data.success) {
        const newEquipment = data.data || []
        if (append) {
          setEquipment(prev => {
            const existingIds = new Set(prev.map(e => e._id))
            const uniqueNew = newEquipment.filter((e: Equipment) => !existingIds.has(e._id))
            return [...prev, ...uniqueNew]
          })
        } else {
          setEquipment(newEquipment)
        }
        setHasMore(data.pagination?.hasMore ?? false)
      }
    } catch (error: any) {
      if (error.name === "AbortError") return
      console.error("Failed to fetch equipment:", error)
      setError("Failed to fetch equipment")
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [selectedCity, selectedType, listingType])

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchEquipment(nextPage, true)
    }
  }, [page, loadingMore, hasMore, fetchEquipment])

  useEffect(() => {
    setPage(1)
    setEquipment([])
    setHasMore(true)
    setLoading(true)
    
    const timer = setTimeout(() => {
      fetchEquipment(1, false)
      setIsInitialMount(false)
    }, 0)
    
    return () => clearTimeout(timer)
  }, [selectedCity, selectedType, listingType, fetchEquipment])

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  // Disable polling for infinite scroll to prevent conflicts
  // usePolling(() => {
  //   if (page === 1) {
  //     fetchEquipment(1, false)
  //   }
  // }, { interval: 30000 })

  return { equipment, loading, loadingMore, hasMore, error, loadMore }
}
