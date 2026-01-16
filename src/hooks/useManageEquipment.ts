import { useState, useEffect, useCallback, useMemo } from "react"
import { Equipment } from "@/src/lib/models/equipment"
import { User } from "@/src/lib/models/user"
import { useEquipmentStore, EquipmentWithSupplier } from "@/src/stores/equipmentStore"
import { useSSE } from './useSSE'
import { useTableFilters } from './useTableFilters'
import { usePagination } from './usePagination'

interface UseManageEquipmentConfig {
  convertToLocalized: (location: string) => string
  supplierId?: string
}

export function useManageEquipment({ convertToLocalized, supplierId }: UseManageEquipmentConfig) {
  const { equipment, loading, setEquipment, setLoading, updateEquipment, shouldRefetch } = useEquipmentStore()
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchEquipment = useCallback(async () => {
    try {
      setLoading(true)
      const url = supplierId 
        ? `/api/equipment?supplierId=${supplierId}&includeSupplier=true`
        : "/api/equipment?admin=true&includeSupplier=true"
      const response = await fetch(url)
      const data = await response.json()
      if (data.success) {
        setEquipment(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching equipment:", error)
    } finally {
      setLoading(false)
    }
  }, [setEquipment, setLoading, supplierId])

  const handleStatusChange = async (id: string, newStatus: string, rejectionReason?: string) => {
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
        updateEquipment(id, { status: newStatus, ...(rejectionReason && { rejectionReason }) })
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

  const {
    searchValue,
    setSearchValue,
    filterValues,
    handleFilterChange,
    filteredData,
  } = useTableFilters({
    data: equipment,
    searchFields: ["name", "location"],
    persistKey: "equipment",
    customSearchFilter: (item, search) => {
      const searchLower = search.toLowerCase()
      const equipmentName = item.name?.toLowerCase() || ""
      const location = item.location?.toLowerCase() || ""
      const supplierName = item.supplier
        ? `${item.supplier.firstName} ${item.supplier.lastName}`.toLowerCase()
        : ""
      return (
        equipmentName.includes(searchLower) ||
        location.includes(searchLower) ||
        supplierName.includes(searchLower)
      )
    },
    filterFunctions: {
      status: (item, value) => {
        if (value === "pendingPricing") return !!item.pendingPricing
        return item.status === value
      },
      listingType: (item, value) => item.listingType === value,
      availability: (item, value) => {
        if (value === "sold")
          return item.listingType === "forSale" && !item.isAvailable
        if (value === "available") return item.isAvailable
        if (value === "unavailable")
          return !item.isAvailable && !(item.listingType === "forSale")
        return true
      },
      location: (item, value) => item.location === value,
    },
    defaultFilters: {
      status: "all",
      listingType: "all",
      availability: "all",
      location: "all",
    },
  })

  const locations = useMemo(() => {
    const uniqueLocations = [...new Set(equipment.map((item) => item.location))]
    return uniqueLocations.sort().map((loc) => ({
      value: loc,
      label: convertToLocalized(loc),
    }))
  }, [equipment, convertToLocalized])

  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    totalItems,
    itemsPerPage,
  } = usePagination({ data: filteredData, itemsPerPage: 10 })

  useSSE('equipment', useCallback(() => {
    fetchEquipment()
  }, [fetchEquipment]))

  useEffect(() => {
    if (shouldRefetch()) {
      fetchEquipment()
    }
  }, [fetchEquipment, shouldRefetch])

  return {
    equipment: paginatedData,
    loading,
    updating,
    handleStatusChange,
    handleAvailabilityChange,
    refetch: fetchEquipment,
    searchValue,
    setSearchValue,
    filterValues,
    handleFilterChange,
    locations,
    currentPage,
    totalPages,
    goToPage,
    totalItems,
    itemsPerPage,
    hasEquipment: equipment.length > 0,
  }
}
