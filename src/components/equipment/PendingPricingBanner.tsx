import { useTranslations, useLocale } from "next-intl"
import { Clock, ArrowRight, ArrowLeft } from "lucide-react"

interface PendingPricingBannerProps {
  currentPricing: any
  pendingPricing: any
  listingType: "forSale" | "forRent"
}

export default function PendingPricingBanner({
  currentPricing,
  pendingPricing,
  listingType,
}: PendingPricingBannerProps) {
  const t = useTranslations("dashboard.equipment")
  const locale = useLocale()
  const isRTL = locale === "ar"

  const formatPrice = (value: number) => `${value} MRU`

  const renderPriceComparison = () => {
    if (listingType === "forSale" && pendingPricing.salePrice !== currentPricing.salePrice) {
      const isNew = !currentPricing.salePrice || currentPricing.salePrice === 0
      return (
        <div className="flex items-center gap-3 text-sm" dir="ltr">
          {isNew ? (
            <>
              <span className="text-orange-600 font-medium">{t("new")}:</span>
              <span className="font-semibold text-orange-700">{formatPrice(pendingPricing.salePrice)}</span>
            </>
          ) : isRTL ? (
            <>
              <span className="font-semibold text-orange-700">{formatPrice(pendingPricing.salePrice)}</span>
              <ArrowLeft className="w-4 h-4 text-orange-500" />
              <span className="text-gray-600">{formatPrice(currentPricing.salePrice)}</span>
            </>
          ) : (
            <>
              <span className="text-gray-600">{formatPrice(currentPricing.salePrice)}</span>
              <ArrowRight className="w-4 h-4 text-orange-500" />
              <span className="font-semibold text-orange-700">{formatPrice(pendingPricing.salePrice)}</span>
            </>
          )}
        </div>
      )
    }

    const prices = []
    if (pendingPricing.hourlyRate && pendingPricing.hourlyRate !== currentPricing.hourlyRate) {
      prices.push({
        label: t("hourlyRate"),
        current: currentPricing.hourlyRate,
        pending: pendingPricing.hourlyRate,
        isNew: !currentPricing.hourlyRate || currentPricing.hourlyRate === 0,
      })
    }
    if (pendingPricing.dailyRate && pendingPricing.dailyRate !== currentPricing.dailyRate) {
      prices.push({
        label: t("dailyRate"),
        current: currentPricing.dailyRate,
        pending: pendingPricing.dailyRate,
        isNew: !currentPricing.dailyRate || currentPricing.dailyRate === 0,
      })
    }
    if (pendingPricing.monthlyRate && pendingPricing.monthlyRate !== currentPricing.monthlyRate) {
      prices.push({
        label: t("monthlyRate"),
        current: currentPricing.monthlyRate,
        pending: pendingPricing.monthlyRate,
        isNew: !currentPricing.monthlyRate || currentPricing.monthlyRate === 0,
      })
    }
    if (pendingPricing.kmRate && pendingPricing.kmRate !== currentPricing.kmRate) {
      prices.push({
        label: t("kmRate"),
        current: currentPricing.kmRate,
        pending: pendingPricing.kmRate,
        isNew: !currentPricing.kmRate || currentPricing.kmRate === 0,
      })
    }
    if (pendingPricing.tonRate && pendingPricing.tonRate !== currentPricing.tonRate) {
      prices.push({
        label: t("tonRate"),
        current: currentPricing.tonRate,
        pending: pendingPricing.tonRate,
        isNew: !currentPricing.tonRate || currentPricing.tonRate === 0,
      })
    }

    return (
      <div className="space-y-2">
        {prices.map((price, idx) => (
          <div key={idx} className="flex items-center gap-3 text-sm">
            <span className="text-gray-500 min-w-[100px]">{price.label}:</span>
            {price.isNew ? (
              <div className="flex items-center gap-2" dir="ltr">
                <span className="text-orange-600 font-medium">{t("new")}</span>
                <span className="font-semibold text-orange-700">{formatPrice(price.pending)}</span>
              </div>
            ) : (
              <div className="flex items-center gap-3" dir="ltr">
                {isRTL ? (
                  <>
                    <span className="font-semibold text-orange-700">{formatPrice(price.pending)}</span>
                    <ArrowLeft className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-600">{formatPrice(price.current)}</span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-600">{formatPrice(price.current)}</span>
                    <ArrowRight className="w-4 h-4 text-orange-500" />
                    <span className="font-semibold text-orange-700">{formatPrice(price.pending)}</span>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg">
      <div className="flex items-start gap-3">
        <Clock className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-orange-700 mb-3">
            {t("pricingPendingApproval")}
          </p>
          {renderPriceComparison()}
        </div>
      </div>
    </div>
  )
}
