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
  const isSold = item.isSold === true
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
  if (item.isSold === true) {
    return t("equipmentSold")
  }
  if (item.listingType === "forSale" && item.hasPendingSale) {
    return t("hasPendingSale")
  }
  if (item.hasActiveBookings) {
    return t("hasActiveBookings")
  }
  return ""
}

export const isAvailabilityDisabled = (item: EquipmentWithSupplier) => {
  return (
    item.status !== "approved" ||
    item.isSold === true ||
    item.hasActiveBookings ||
    item.hasPendingSale
  )
}
