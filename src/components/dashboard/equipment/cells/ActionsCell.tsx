import { useTranslations } from "next-intl"
import { useRouter } from "@/src/i18n/navigation"
import { Edit, Eye, Loader2 } from "lucide-react"
import { canEditEquipment } from "@/src/utils/equipmentHelpers"
import { useEquipmentStore } from "@/src/stores/equipmentStore"
import { EquipmentWithSupplier } from "@/src/lib/models/equipment"
import { memo, useMemo, useCallback } from "react"
interface ActionsCellProps {
  item: EquipmentWithSupplier
}

function ActionsCell({ item }: ActionsCellProps) {
  const t = useTranslations("dashboard.equipment")
  const router = useRouter()
  const isSupplier = useEquipmentStore((state) => state.isSupplier)
  const navigating = useEquipmentStore((state) => state.navigating)
  const navigateToEquipment = useEquipmentStore((state) => state.navigateToEquipment)
  
  const canEdit = useMemo(() => canEditEquipment(item, isSupplier), [item, isSupplier])

  const equipmentId = item._id?.toString() || ""
  const editNavId = `edit-${equipmentId}`

  const handleEdit = useCallback(() => {
    navigateToEquipment(`/dashboard/equipment/edit/${equipmentId}`, editNavId, router)
  }, [navigateToEquipment, equipmentId, editNavId, router])

  const handleView = useCallback(() => {
    navigateToEquipment(`/equipment/${equipmentId}?admin=true`, equipmentId, router)
  }, [navigateToEquipment, equipmentId, router])

  return (
    <td className="px-6 py-4">
      <div className="flex items-center justify-end gap-2 min-h-[40px] w-[88px] mx-auto">
        {canEdit && (
          <button
            onClick={handleEdit}
            disabled={navigating === editNavId}
            className="p-2 font-medium text-blue-600 hover:bg-blue-50 transition-colors"
            title={t("editEquipment")}
          >
            {navigating === editNavId ? <Loader2 className="w-5 h-5 animate-spin" /> : <Edit className="w-5 h-5" />}
          </button>
        )}
        <button
          onClick={handleView}
          disabled={navigating === equipmentId}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          title={t("viewDetails")}
        >
          {navigating === equipmentId ? <Loader2 className="w-5 h-5 animate-spin" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </td>
  )
}

export default memo(ActionsCell)
