import { useState, useEffect, useCallback, useMemo } from "react"
import { useEquipmentStore } from "@/src/stores/equipmentStore"
import { usePolling } from "./usePolling"
import { EquipmentStatus } from "@/src/lib/types"

interface UseManageEquipmentConfig {
  convertToLocalized: (location: string) => string
  supplierId?: string
}

export function useManageEquipment({
  convertToLocalized,
  supplierId,
}: UseManageEquipmentConfig) {
  const {
    equipment,
    loading,
    setEquipment,
    setLoading,
    updateEquipment,
    invalidateCache,
  } = useEquipmentStore()
  const [updating, setUpdating] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchValue, setSearchValue] = useState("")
  const [filterValues, setFilterValues] = useState({
    status: "all",
    listingType: "all",
    availability: "all",
    location: "all",
  })
  const itemsPerPage = 10

  const fetchEquipment = useCallback(async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()
      params.set("page", currentPage.toString())
      params.set("limit", itemsPerPage.toString())
      params.set("includeSupplier", "true")

      if (supplierId) {
        params.set("supplierId", supplierId)
      } else {
        params.set("admin", "true")
      }

      if (searchValue.trim()) {
        params.set("search", searchValue.trim())
      }

      if (filterValues.status !== "all") {
        if (filterValues.status === "pendingPricing") {
          params.set("hasPendingPricing", "true")
        } else {
          params.set("status", filterValues.status)
        }
      }

      if (filterValues.listingType !== "all") {
        params.set("listingType", filterValues.listingType)
      }

      if (filterValues.availability === "available") {
        params.set("available", "true")
      } else if (filterValues.availability === "unavailable") {
        params.set("available", "false")
        params.set("excludeSold", "true")
      } else if (filterValues.availability === "sold") {
        params.set("available", "false")
        params.set("listingType", "forSale")
      }

      if (filterValues.location !== "all") {
        params.set("city", filterValues.location)
      }

      const url = `/api/equipment?${params.toString()}`
      const response = await fetch(url, { cache: "no-store" })
      const data = await response.json()

      if (data.success) {
        setEquipment(data.data || [])
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages)
          setTotalCount(data.pagination.totalCount)
        }
      }
    } catch (error) {
      console.error("Error fetching equipment:", error)
    } finally {
      setLoading(false)
    }
  }, [
    setEquipment,
    setLoading,
    supplierId,
    currentPage,
    itemsPerPage,
    searchValue,
    filterValues,
  ])

  const handleStatusChange = async (
    id: string,
    newStatus: EquipmentStatus,
    rejectionReason?: string,
  ) => {
    setUpdating(id)
    try {
      const body: any = { status: newStatus }
      if (newStatus === "rejected" && rejectionReason) {
        body.rejectionReason = rejectionReason
      }
      const response = await fetch(`/api/equipment/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (response.ok) {
        updateEquipment(id, {
          status: newStatus,
          ...(rejectionReason && { rejectionReason }),
        })
        return true
      }
      return false
    } catch (error) {
      return false
    } finally {
      setUpdating(null)
    }
  }

  const handleAvailabilityChange = async (id: string, isAvailable: boolean) => {
    setUpdating(id)
    try {
      const response = await fetch(`/api/equipment/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable }),
      })
      if (response.ok) {
        updateEquipment(id, { isAvailable })
        return true
      }
      return false
    } catch (error) {
      return false
    } finally {
      setUpdating(null)
    }
  }

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      setFilterValues((prev) => ({ ...prev, [key]: value }))
      if (currentPage !== 1) {
        setCurrentPage(1)
      }
    },
    [currentPage],
  )

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value)
      if (currentPage !== 1) {
        setCurrentPage(1)
      }
    },
    [currentPage],
  )

  const locations = useMemo(() => {
    const uniqueLocations = [...new Set(equipment.map((item) => item.location))]
    return uniqueLocations.sort().map((loc) => ({
      value: loc,
      label: convertToLocalized(loc),
    }))
  }, [equipment, convertToLocalized])

  usePolling(fetchEquipment, { interval: 30000 })

  useEffect(() => {
    fetchEquipment()
  }, [fetchEquipment])

  return {
    equipment,
    loading,
    updating,
    handleStatusChange,
    handleAvailabilityChange,
    refetch: useCallback(() => {
      invalidateCache()
      return fetchEquipment()
    }, [invalidateCache, fetchEquipment]),
    searchValue,
    setSearchValue: handleSearchChange,
    filterValues,
    handleFilterChange,
    locations,
    currentPage,
    totalPages,
    goToPage: setCurrentPage,
    totalItems: totalCount,
    itemsPerPage,
  }
}
