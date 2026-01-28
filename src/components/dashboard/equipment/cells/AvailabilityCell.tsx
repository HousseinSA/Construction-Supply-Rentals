import { useTranslations } from "next-intl"
import Dropdown from "@/src/components/ui/Dropdown"
import TooltipWrapper from "@/src/components/ui/TooltipWrapper"
import { getAvailabilityTooltipMessage, isAvailabilityDisabled } from "@/src/utils/equipmentHelpers"
import { Equipment } from "@/src/lib/models/equipment"
import { User } from "@/src/lib/models/user"
import { memo, useMemo, useCallback } from "react"

interface EquipmentWithSupplier extends Equipment {
  supplier?: User
  hasActiveBookings?: boolean
  hasPendingSale?: boolean
}

interface AvailabilityCellProps {
  item: EquipmentWithSupplier
  onAvailabilityChange: (id: string, isAvailable: boolean) => void
}

function AvailabilityCell({ item, onAvailabilityChange }: AvailabilityCellProps) {
  const t = useTranslations("dashboard.equipment")
  
  const options = useMemo(
    () => [
      { value: "available", label: t("available") },
      { value: "unavailable", label: t("unavailable") },
    ],
    [t]
  )

  const tooltipMessage = useMemo(() => getAvailabilityTooltipMessage(item, t), [
    item.listingType,
    item.hasActiveBookings,
    item.hasPendingSale,
    item.status,
    t,
  ])

  const disabled = useMemo(() => isAvailabilityDisabled(item), [
    item.listingType,
    item.hasActiveBookings,
    item.hasPendingSale,
    item.status,
  ])

  const currentValue = item.isAvailable ? "available" : "unavailable"
  const equipmentId = item._id?.toString() || ""

  const handleChange = useCallback(
    (val: string) => {
      onAvailabilityChange(equipmentId, val === "available")
    },
    [equipmentId, onAvailabilityChange]
  )

  return (
    <td className="px-6 py-4">
      <div className="flex justify-center overflow-visible">
        {disabled && tooltipMessage ? (
          <TooltipWrapper content={tooltipMessage}>
            <div>
              <Dropdown options={options} value={currentValue} onChange={() => {}} compact disabled />
            </div>
          </TooltipWrapper>
        ) : (
          <Dropdown options={options} value={currentValue} onChange={handleChange} compact disabled={disabled} />
        )}
      </div>
    </td>
  )
}

export default memo(AvailabilityCell)
