import { useTranslations } from "next-intl"
import { useRouter } from "@/src/i18n/navigation"
import { Edit, Eye, Loader2 } from "lucide-react"
import { canEditEquipment } from "@/src/utils/equipmentHelpers"
import { Equipment } from "@/src/lib/models/equipment"
import { User } from "@/src/lib/models/user"
import { memo, useMemo, useCallback } from "react"

interface EquipmentWithSupplier extends Equipment {
  supplier?: User
  hasActiveBookings?: boolean
  hasPendingSale?: boolean
}

interface ActionsCellProps {
  item: EquipmentWithSupplier
  isSupplier: boolean
  navigating?: string | null
  onNavigate?: (url: string, id: string) => void
}

function ActionsCell({ item, isSupplier, navigating, onNavigate }: ActionsCellProps) {
  const t = useTranslations("dashboard.equipment")
  const router = useRouter()
  
  const canEdit = useMemo(() => canEditEquipment(item, isSupplier), [
    item.status,
    item.hasActiveBookings,
    item.hasPendingSale,
    isSupplier,
  ])

  const equipmentId = item._id?.toString() || ""
  const editNavId = `edit-${equipmentId}`

  const handleEdit = useCallback(() => {
    if (onNavigate) {
      onNavigate(`/dashboard/equipment/edit/${equipmentId}`, editNavId)
    } else {
      router.push(`/dashboard/equipment/edit/${equipmentId}`)
    }
  }, [onNavigate, equipmentId, editNavId, router])

  const handleView = useCallback(() => {
    if (onNavigate) {
      onNavigate(`/equipment/${equipmentId}?admin=true`, equipmentId)
    } else {
      router.push(`/equipment/${equipmentId}?admin=true`)
    }
  }, [onNavigate, equipmentId, router])

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
