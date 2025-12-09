import { useState, useEffect, useCallback, useMemo } from "react"
import { Equipment } from "@/src/lib/models/equipment"
import { User } from "@/src/lib/models/user"
import { useEquipmentStore, EquipmentWithSupplier } from "@/src/stores/equipmentStore"
import { useRealtime } from './useRealtime'
import { useTableFilters } from './useTableFilters'
import { usePagination } from './usePagination'

interface UseManageEquipmentConfig {
  convertToLocalized: (location: string) => string
}

export function useManageEquipment({ convertToLocalized }: UseManageEquipmentConfig) {
  const { equipment, loading, setEquipment, setLoading, updateEquipment } = useEquipmentStore()
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchEquipment = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/equipment?admin=true")
      const data = await response.json()
      if (data.success) {
        const usersResponse = await fetch("/api/users")
        const usersData = await usersResponse.json()

        const equipmentWithSuppliers = data.data.map((item: Equipment) => {
          if (
            item.createdBy === "supplier" &&
            item.supplierId &&
            usersData.success
          ) {
            const supplierId = item.supplierId.toString()
            const supplier = usersData.data.find(
              (user: User) => user._id?.toString() === supplierId
            )
            if (supplier) {
              return { ...item, supplier } as EquipmentWithSupplier
            }
          }
          return item as EquipmentWithSupplier
        })
        setEquipment(equipmentWithSuppliers)
      }
    } catch (error) {
      console.error("Error fetching equipment:", error)
    } finally {
      setLoading(false)
    }
  }, [setEquipment, setLoading])

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdating(id)
    try {
      const response = await fetch(`/api/equipment/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        updateEquipment(id, { status: newStatus })
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
      status: (item, value) => item.status === value,
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

  useRealtime('equipment', useCallback(() => {
    fetchEquipment()
  }, [fetchEquipment]))

  useEffect(() => {
    fetchEquipment()
  }, [fetchEquipment])

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
