import { useTranslations } from "next-intl"
import TooltipWrapper from "@/src/components/ui/TooltipWrapper"
import { getStatusBadgeStyles } from "@/src/utils/equipmentHelpers"
import { useEquipmentStore } from "@/src/stores/equipmentStore"
import { EquipmentWithSupplier } from "@/src/lib/models/equipment"
import { memo, useMemo, useCallback } from "react"

interface StatusCellProps {
  item: EquipmentWithSupplier
}

function StatusCell({ item }: StatusCellProps) {
  const t = useTranslations("dashboard.equipment")
  const isSupplier = useEquipmentStore((state) => state.isSupplier)
  const updating = useEquipmentStore((state) => state.updating)
  const updateStatus = useEquipmentStore((state) => state.updateEquipmentStatus)
  
  const { status } = item
  const equipmentId = item._id?.toString() || ""
  const isPending = status === "pending"
  const isRejected = status === "rejected"

  const badgeStyles = useMemo(() => getStatusBadgeStyles(status), [status])

  const handleApprove = useCallback(() => {
    updateStatus(equipmentId, "approved", undefined, t)
  }, [equipmentId, updateStatus, t])

  const handleReject = useCallback(() => {
    updateStatus(equipmentId, "rejected", undefined, t)
  }, [equipmentId, updateStatus, t])

  return (
    <td className="px-6 py-4 text-center">
      <div className="flex flex-col items-center gap-1.5">
        {isPending && !isSupplier ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={handleApprove}
              disabled={updating === equipmentId}
              className="px-3 py-1.5 text-xs font-medium bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              {t("approve")}
            </button>
            <button
              onClick={handleReject}
              disabled={updating === equipmentId}
              className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {t("reject")}
            </button>
          </div>
        ) : isRejected && isSupplier ? (
          <TooltipWrapper content={t("editBeforeResubmit")}>
            <span className="inline-block px-3 py-1.5 text-xs font-semibold rounded-md bg-red-100 text-red-700 cursor-help">
              {t("rejected")}
            </span>
          </TooltipWrapper>
        ) : (
          <span className={`inline-block px-3 py-1.5 text-xs font-semibold rounded-md ${badgeStyles}`}>
            {isSupplier && isPending ? t("pendingVerification") : t(status)}
          </span>
        )}
      </div>
    </td>
  )
}

export default memo(StatusCell)
