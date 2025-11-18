import { useState, useEffect } from "react"
import { showToast } from "@/src/lib/toast"
import { Equipment } from "@/src/lib/models/equipment"
import { User } from "@/src/lib/models/user"

interface EquipmentWithSupplier extends Equipment {
  supplier?: User
}

export function useManageEquipment() {
  const [equipment, setEquipment] = useState<EquipmentWithSupplier[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/equipment?admin=true")
      const data = await response.json()
      console.log("row data", data)
      if (data.success) {
        const usersResponse = await fetch("/api/users")
        const usersData = await usersResponse.json()

        const equipmentWithSuppliers = data.data.map((item: Equipment) => {
          // Only add supplier info if equipment was created by supplier and has supplierId
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
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdating(id)
    try {
      const response = await fetch(`/api/equipment/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        setEquipment((prev) =>
          prev.map((item) =>
            item._id?.toString() === id ? { ...item, status: newStatus } : item
          )
        )
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
        setEquipment((prev) =>
          prev.map((item) =>
            item._id?.toString() === id ? { ...item, isAvailable } : item
          )
        )
        return true
      }
      return false
    } catch (error) {
      return false
    } finally {
      setUpdating(null)
    }
  }

  useEffect(() => {
    fetchEquipment()
  }, [])

  return {
    equipment,
    loading,
    updating,
    handleStatusChange,
    handleAvailabilityChange,
    refetch: fetchEquipment,
  }
}
