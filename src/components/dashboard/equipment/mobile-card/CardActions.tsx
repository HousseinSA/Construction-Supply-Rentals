import { Edit, Eye, Loader2 } from "lucide-react"
import { useEquipmentStore } from "@/src/stores/equipmentStore"
import { useUserSession } from "@/src/hooks/useUserSession"
import { useTranslations } from "next-intl"
import { useRouter } from "@/src/i18n/navigation"
import { EquipmentWithSupplier } from "@/src/lib/models/equipment"

interface CardActionsProps {
  item: EquipmentWithSupplier
}

export default function CardActions({ item }: CardActionsProps) {
  const { user } = useUserSession()
  const isSupplier = user?.isSupplier ?? false
  const { navigating, navigateToEquipment } = useEquipmentStore()
  const t = useTranslations("dashboard.equipment")
  const router = useRouter()

  const { _id, status, createdBy, isSold } = item
  const itemId = _id?.toString() || ""

  const canEdit = !isSupplier && createdBy === "admin" && !isSold
  const canEditSupplier = isSupplier && (status === "rejected" || status === "approved") && !isSold

  return (
    <div className="flex gap-2">
      {canEdit && (
        <button
          onClick={() => navigateToEquipment(`/dashboard/equipment/edit/${itemId}`, `edit-${itemId}`, router)}
          disabled={navigating === `edit-${itemId}`}
          className="px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100"
        >
          {navigating === `edit-${itemId}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit className="w-4 h-4" />}
        </button>
      )}
      {canEditSupplier && (
        <button
          onClick={() => navigateToEquipment(`/dashboard/equipment/edit/${itemId}`, `edit-${itemId}`, router)}
          disabled={navigating === `edit-${itemId}`}
          className="px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100"
        >
          {navigating === `edit-${itemId}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit className="w-4 h-4" />}
        </button>
      )}
      <button
        onClick={() => navigateToEquipment(`/equipment/${itemId}?admin=true`, itemId, router)}
        disabled={navigating === itemId}
        className="flex-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium flex items-center justify-center gap-1.5"
      >
        {navigating === itemId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
        {t("viewDetails")}
      </button>
    </div>
  )
}
