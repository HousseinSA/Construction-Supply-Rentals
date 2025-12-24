import { XCircle } from "lucide-react"
import { useTranslations } from "next-intl"

interface PricingRejectionBannerProps {
  rejectionReason: string
  onDismiss?: () => void
}

export default function PricingRejectionBanner({
  rejectionReason,
  onDismiss,
}: PricingRejectionBannerProps) {
  const t = useTranslations("dashboard.equipment")
  
  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start gap-3">
        <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-700 mb-2">
            {t("pricingUpdateRejectedMessage")}
          </p>
          <p className="text-sm text-red-600">{rejectionReason}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}
