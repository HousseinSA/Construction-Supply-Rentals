import { AlertCircle } from "lucide-react"
import { useTranslations } from "next-intl"

export default function EquipmentRejectionBanner({ rejectionReason }:{rejectionReason: string | null}) {
  const t = useTranslations("dashboard.equipment")

  if (!rejectionReason) return null

  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-700 mb-2">
            {t("equipmentRejected")}
          </p>
          <p className="text-sm text-red-600">{rejectionReason}</p>
        </div>
      </div>
    </div>
  )
}
