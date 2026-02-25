import { useLocale } from "next-intl"
import { Equipment, EquipmentWithSupplier } from "@/src/lib/models/equipment"
import { useEquipmentPrices } from "@/src/hooks/useEquipmentPrices"
import EquipmentImageCell from "./cells/EquipmentImageCell"
import { MemoizedLocationCell, MemoizedDateCell } from "./cells/SimpleCells"
import PriceCell from "./cells/PriceCell"
import SupplierCell from "./cells/SupplierCell"
import StatusCell from "./cells/StatusCell"
import AvailabilityCell from "./cells/AvailabilityCell"
import ActionsCell from "./cells/ActionsCell"

interface EquipmentTableRowProps {
  item: EquipmentWithSupplier
  updating: string | null
  navigating?: string | null
  onStatusChange: (
    id: string,
    action: "approve" | "reject",
    reason?: string,
  ) => void
  onAvailabilityChange: (id: string, isAvailable: boolean) => void
  onNavigate?: (url: string, id: string) => void
  onPricingReview?: (item: EquipmentWithSupplier) => void
  isSupplier?: boolean
  localizedLocation: string
  t: (key: string) => string
}

export default function EquipmentTableRow({
  item,
  updating,
  navigating,
  onStatusChange,
  onAvailabilityChange,
  onNavigate,
  onPricingReview,
  isSupplier = false,
  localizedLocation,
  t,
}: EquipmentTableRowProps) {
  const equipmentId = item._id?.toString() || ""
  const locale = useLocale()
  const prices = useEquipmentPrices(item, false)
  const isRTL = locale === "ar"
  const borderSide = isRTL ? "border-r-4" : "border-l-4"
  const borderClass = item.pendingPricing
    ? `bg-orange-50 border-orange-400 ${borderSide}`
    : item.rejectedPricingValues && Object.keys(item.rejectedPricingValues).length > 0 && isSupplier
      ? `bg-red-50 border-red-400 ${borderSide}`
      : ""
  return (
    <tr className={`hover:bg-gray-50 transition-colors ${borderClass}`}>
      <EquipmentImageCell
        images={item.images}
        name={item.name}
        referenceNumber={item.referenceNumber}
        status={item.status}
        rejectionReason={item.rejectionReason}
        createdBy={item.createdBy}
        listingType={item.listingType}
        isAvailable={item.isAvailable}
        equipmentId={equipmentId}
        navigating={navigating}
        onNavigate={onNavigate}
        t={t}
      />
      <MemoizedLocationCell location={localizedLocation} />
      <PriceCell
        prices={prices}
        item={item}
        isSupplier={isSupplier}
        onPricingReview={onPricingReview}
      />
      {!isSupplier && (
        <SupplierCell createdBy={item.createdBy} supplier={item.supplier} />
      )}
      <MemoizedDateCell date={item.createdAt} />
      <StatusCell
        status={item.status}
        isSupplier={isSupplier}
        isPending={item.status === "pending"}
        isRejected={item.status === "rejected"}
        updating={updating}
        equipmentId={equipmentId}
        onStatusChange={onStatusChange}
      />
      <AvailabilityCell
        item={item}
        onAvailabilityChange={onAvailabilityChange}
      />
      <ActionsCell
        item={item}
        isSupplier={isSupplier}
        navigating={navigating}
        onNavigate={onNavigate}
      />
    </tr>
  )
}
