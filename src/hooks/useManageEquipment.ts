import { useState, useEffect, useCallback } from "react"
import { showToast } from "@/src/lib/toast"
import { Equipment } from "@/src/lib/models/equipment"
import { User } from "@/src/lib/models/user"
import { useEquipmentStore, EquipmentWithSupplier } from "@/src/stores/equipmentStore"
import { useRealtime } from './useRealtime'

export function useManageEquipment() {
  const { equipment, loading, setEquipment, setLoading, updateEquipment, shouldRefetch } = useEquipmentStore()
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

  useRealtime('equipment', useCallback(() => {
    fetchEquipment()
  }, [fetchEquipment]))

  useEffect(() => {
    fetchEquipment()
  }, [fetchEquipment])

  return {
    equipment,
    loading,
    updating,
    handleStatusChange,
    handleAvailabilityChange,
    refetch: fetchEquipment,
  }
}
