"use client"

import { useMemo, useState, useRef } from "react"
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import { Send } from "lucide-react"
import { usePriceFormatter } from "@/src/hooks/usePriceFormatter"
import { useBookingModal } from "@/src/hooks/useBookingModal"
import BaseRequestModal from "@/src/components/shared/BaseRequestModal"
import Input from "@/src/components/ui/Input"
import Dropdown from "@/src/components/ui/Dropdown"
import PriceCalculation from "./PriceCalculation"
import TransportSection from "./TransportSection"
import { PricingType } from "@/src/lib/types"
import { requiresTransport } from "@/src/lib/constants/transport"

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

  const params = useParams()
  const locale = params?.locale as string || 'fr'
  
  const [selectedPricingType, setSelectedPricingType] = useState<PricingType>(
    availablePricingTypes[0]?.type || "daily"
  )
  const [selectedPorteChar, setSelectedPorteChar] = useState<any>(null)
  const [distance, setDistance] = useState(0)

  const needsTransport = requiresTransport(equipment?.name || '')

  const { usage, setUsage, message, setMessage, loading, handleSubmit, resetForm } =
    useBookingModal(equipment, onBookingSuccess, onClose, selectedPricingType, selectedPorteChar, distance)

  if (!isOpen || !equipment) return null

  const selectedPricing = availablePricingTypes.find(
    (p) => p.type === selectedPricingType
  )
  const rate = selectedPricing?.rate || 0
  const unit = selectedPricing?.label || ""
  const subtotal = rate * usage
  const usageLabel = unit
  
  const transportCost = selectedPorteChar && distance > 0
    ? selectedPorteChar.pricing.kmRate * distance
    : 0
  const grandTotal = subtotal + transportCost

  return (
    <BaseRequestModal
      isOpen={isOpen}
      onClose={() => {
        resetForm()
        onClose()
      }}
      title={t("title")}
      equipmentName={equipment.name}
      equipmentLocation={equipment.location}
      message={message}
      onMessageChange={setMessage}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel={t("sendRequest")}
      submittingLabel={t("sending")}
      messageLabel={t("message")}
      optionalLabel={t("optional")}
      messagePlaceholder={t("messagePlaceholder")}
      submitIcon={<Send className="w-4 h-4" />}
    >
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

      {needsTransport && (
        <TransportSection
          isRequired={true}
          selectedPorteChar={selectedPorteChar}
          distance={distance}
          onPorteCharChange={setSelectedPorteChar}
          onDistanceChange={setDistance}
          locale={locale}
        />
      )}

      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <p className="text-sm font-semibold text-gray-700">{t("costBreakdown")}</p>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{t("equipment")}:</span>
          <span className="font-medium" dir="ltr">{subtotal.toLocaleString()} MRU</span>
        </div>
        {transportCost > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t("transport")}:</span>
            <span className="font-medium" dir="ltr">{transportCost.toLocaleString()} MRU</span>
          </div>
        )}
        <div className="border-t pt-2 flex justify-between">
          <span className="font-semibold">{t("estimatedTotal")}:</span>
          <span className="font-bold text-primary text-lg" dir="ltr">{grandTotal.toLocaleString()} MRU</span>
        </div>
      </div>
    </BaseRequestModal>
  )
}
