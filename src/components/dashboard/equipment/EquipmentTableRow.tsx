import { useLocale } from "next-intl"
import { EquipmentWithSupplier } from "@/src/lib/models/equipment"
import { useEquipmentStore } from "@/src/stores/equipmentStore"
import EquipmentImageCell from "./cells/EquipmentImageCell"
import { MemoizedLocationCell, MemoizedDateCell } from "./cells/SimpleCells"
import PriceCell from "./cells/PriceCell"
import SupplierCell from "./cells/SupplierCell"
import StatusCell from "./cells/StatusCell"
import AvailabilityCell from "./cells/AvailabilityCell"
import ActionsCell from "./cells/ActionsCell"

interface EquipmentTableRowProps {
  item: EquipmentWithSupplier
  onStatusChange: (id: string, action: "approve" | "reject") => void
}

export default function EquipmentTableRow({ item, onStatusChange }: EquipmentTableRowProps) {
  const locale = useLocale()
  const isSupplier = useEquipmentStore((state) => state.isSupplier)
  const convertToLocalized = useEquipmentStore((state) => state.convertToLocalized)
  
  if (!convertToLocalized) return null
  
  const isRTL = locale === "ar"
  const borderSide = isRTL ? "border-r-4" : "border-l-4"
  const borderClass = item.pendingPricing
    ? `bg-orange-50 border-orange-400 ${borderSide}`
    : item.rejectedPricingValues && Object.keys(item.rejectedPricingValues).length > 0 && isSupplier
      ? `bg-red-50 border-red-400 ${borderSide}`
      : ""
      
  return (
    <tr className={`hover:bg-gray-50 transition-colors ${borderClass}`}>
      <EquipmentImageCell item={item} />
      <MemoizedLocationCell location={convertToLocalized(item.location)} />
      <PriceCell item={item} />
      {!isSupplier && (
        <SupplierCell createdBy={item.createdBy} supplier={item.supplier} />
      )}
      <MemoizedDateCell date={item.createdAt} />
      <StatusCell item={item} onStatusChange={onStatusChange} />
      <AvailabilityCell item={item} />
      <ActionsCell item={item} />
    </tr>
  )
}
