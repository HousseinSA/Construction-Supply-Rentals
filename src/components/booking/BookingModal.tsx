"use client"

import { useRef, useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { Send } from "lucide-react"
import { usePriceFormatter } from "@/src/hooks/usePriceFormatter"
import { useBookingModal } from "@/src/hooks/useBookingModal"
import { useModalClose } from "@/src/hooks/useModalClose"
import Button from "@/src/components/ui/Button"
import Input from "@/src/components/ui/Input"
import Dropdown from "@/src/components/ui/Dropdown"
import ModalHeader from "./ModalHeader"
import EquipmentInfo from "./EquipmentInfo"
import PriceCalculation from "./PriceCalculation"
import { PricingType } from "@/src/lib/types"

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  equipment: any
  onBookingSuccess?: () => void
}

export default function BookingModal({
  isOpen,
  onClose,
  equipment,
  onBookingSuccess,
}: BookingModalProps) {
  const t = useTranslations("booking")
  const tCommon = useTranslations("common")
  const modalRef = useRef<HTMLDivElement>(null)
  const { formatPrice } = usePriceFormatter()

  const availablePricingTypes = useMemo(() => {
    if (!equipment?.pricing) return []
    const types: { type: PricingType; label: string; rate: number }[] = []
    if (equipment.pricing.hourlyRate)
      types.push({
        type: "hourly",
        label: tCommon("hour"),
        rate: equipment.pricing.hourlyRate,
      })
    if (equipment.pricing.dailyRate)
      types.push({
        type: "daily",
        label: tCommon("day"),
        rate: equipment.pricing.dailyRate,
      })
    if (equipment.pricing.monthlyRate)
      types.push({
        type: "monthly",
        label: tCommon("month"),
        rate: equipment.pricing.monthlyRate,
      })
    if (equipment.pricing.kmRate)
      types.push({
        type: "per_km",
        label: tCommon("km"),
        rate: equipment.pricing.kmRate,
      })
    if (equipment.pricing.tonRate)
      types.push({
        type: "per_ton",
        label: tCommon("ton"),
        rate: equipment.pricing.tonRate,
      })
    return types
  }, [equipment, tCommon])

  const [selectedPricingType, setSelectedPricingType] = useState<PricingType>(
    availablePricingTypes[0]?.type || "daily"
  )

  const { usage, setUsage, message, setMessage, loading, handleSubmit, resetForm } =
    useBookingModal(equipment, onBookingSuccess, onClose, selectedPricingType)

  const handleClose = () => {
    resetForm()
    onClose()
  }

  useModalClose(isOpen, handleClose, modalRef)

  if (!isOpen || !equipment) return null

  const selectedPricing = availablePricingTypes.find(
    (p) => p.type === selectedPricingType
  )
  const rate = selectedPricing?.rate || 0
  const unit = selectedPricing?.label || ""
  const subtotal = rate * usage
  const usageLabel = unit

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-200">
        <div className="p-6">
          <ModalHeader title={t("title")} onClose={handleClose} />
          <EquipmentInfo name={equipment.name} location={equipment.location} />

          <form onSubmit={handleSubmit} className="space-y-4">
            {availablePricingTypes.length > 1 && (
              <Dropdown
                label={t("pricingType")}
                options={availablePricingTypes.map((pricing) => {
                  return {
                    value: pricing.type,
                    label: `${pricing.rate.toLocaleString()} MRU / ${pricing.label}`,
                  }
                })}
                value={selectedPricingType}
                onChange={(value) => {
                  setSelectedPricingType(value as PricingType)
                  setUsage(0)
                }}
                useAbsolutePosition
                priceDisplay
              />
            )}

            <Input
              type="text"
              label={`${t("usage")} (${usageLabel})`}
              value={usage}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "")
                setUsage(val ? Number(val) : 0)
              }}
              required
            />

            <PriceCalculation
              rate={rate}
              unit={unit}
              usage={usage}
              usageLabel={usageLabel}
              subtotal={subtotal}
              labels={{
                calculation: t("calculation"),
                rate: t("rate"),
                usage: t("usage"),
                total: t("total"),
              }}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("message")} ({t("optional")})
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all duration-200"
                placeholder={t("messagePlaceholder")}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {loading ? t("sending") : t("sendRequest")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
