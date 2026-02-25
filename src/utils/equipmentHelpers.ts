import { Equipment, EquipmentWithSupplier } from "@/src/lib/models/equipment"

export const getStatusBadgeStyles = (status: string) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  }
  return styles[status as keyof typeof styles] || styles.rejected
}

export const canEditEquipment = (
  item: EquipmentWithSupplier,
  isSupplier: boolean
) => {
  const isSold = item.listingType === "forSale" && !item.isAvailable
  const hasActiveItems = item.hasActiveBookings || item.hasPendingSale

  if (isSupplier) {
    return (
      (item.status === "rejected" ||
        (item.status === "approved" && !hasActiveItems)) &&
      !isSold
    )
  }

  return item.status === "approved" && !hasActiveItems && !isSold
}

export const getAvailabilityTooltipMessage = (
  item: EquipmentWithSupplier,
  t: (key: string) => string
) => {
  if (item.status !== "approved") {
    return t("pendingVerification")
  }
  if (item.hasActiveBookings || item.hasPendingSale) {
    return t("cannotEditActiveBooking")
  }
  if (item.listingType === "forSale" && !item.isAvailable) {
    return t("equipmentSold")
  }
  return ""
}

export const isAvailabilityDisabled = (item: EquipmentWithSupplier) => {
  return (
    item.status !== "approved" ||
    (item.listingType === "forSale" && !item.isAvailable) ||
    item.hasActiveBookings ||
    item.hasPendingSale
  )
}
