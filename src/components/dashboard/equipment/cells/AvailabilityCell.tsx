import { useTranslations } from "next-intl"
import Dropdown from "@/src/components/ui/Dropdown"
import TooltipWrapper from "@/src/components/ui/TooltipWrapper"
import { getAvailabilityTooltipMessage, isAvailabilityDisabled } from "@/src/utils/equipmentHelpers"
import { useEquipmentStore } from "@/src/stores/equipmentStore"
import { EquipmentWithSupplier } from "@/src/lib/models/equipment"
import { memo, useMemo, useCallback } from "react"

interface AvailabilityCellProps {
  item: EquipmentWithSupplier
}

function AvailabilityCell({ item }: AvailabilityCellProps) {
  const t = useTranslations("dashboard.equipment")
  const updateEquipmentAvailability = useEquipmentStore(
    state => state.updateEquipmentAvailability
  )
  
  const options = useMemo(
    () => [
      { value: "available", label: t("available") },
      { value: "unavailable", label: t("unavailable") },
    ],
    [t]
  )

  const tooltipMessage = useMemo(() => getAvailabilityTooltipMessage(item, t), [item, t])

  const disabled = useMemo(() => isAvailabilityDisabled(item), [item])

  const currentValue = item.isAvailable ? "available" : "unavailable"

  const handleChange = useCallback(
    (val: string) => {
      updateEquipmentAvailability(item._id?.toString() || "", val === "available", t)
    },
    [item._id, updateEquipmentAvailability, t]
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
