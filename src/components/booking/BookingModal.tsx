"use client"

import { useMemo, useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useParams, useRouter } from "next/navigation"
import { Send } from "lucide-react"
import { useBookingModal } from "@/src/hooks/useBookingModal"
import BaseRequestModal from "@/src/components/shared/BaseRequestModal"
import Input from "@/src/components/ui/Input"
import DatePicker from "@/src/components/ui/DatePicker"
import PriceCalculation from "./PriceCalculation"
import { PricingType } from "@/src/lib/types"
import { Equipment } from "@/src/lib/models/equipment"

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  equipment: Equipment
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
  const params = useParams()
  const router = useRouter()
  const locale = (params?.locale as string) || "fr"
  const [bookedRanges, setBookedRanges] = useState<
    Array<{ start: Date | string; end: Date | string }>
  >([])

  useEffect(() => {
    if (isOpen && equipment?._id) {
      fetch(`/api/equipment/${equipment._id}/booked-dates`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setBookedRanges(data.data)
          }
        })
        .catch((err) => console.error("Failed to fetch booked dates:", err))
    }
  }, [isOpen, equipment?._id])

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

  const {
    usage,
    setUsage,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    message,
    setMessage,
    loading,
    handleSubmit,
    resetForm,
    validateBooking,
  } = useBookingModal(
    equipment,
    onBookingSuccess,
    onClose,
    selectedPricingType,
    router,
    locale
  )

  if (!isOpen || !equipment) return null

  const selectedPricing = availablePricingTypes.find(
    (p) => p.type === selectedPricingType
  )
  const rate = selectedPricing?.rate || 0
  const unit = selectedPricing?.label || ""
  const subtotal = rate * usage
  const usageLabel = unit
  const validation = validateBooking(selectedPricingType)
  const isFormValid = validation.valid

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
      isSubmitDisabled={!isFormValid}
    >
      {availablePricingTypes.length > 1 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t("pricingType")} <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {availablePricingTypes.map((pricing) => (
              <button
                key={pricing.type}
                type="button"
                onClick={() => {
                  if (selectedPricingType !== pricing.type) {
                    setSelectedPricingType(pricing.type)
                    setUsage(0)
                  }
                }}
                className={`flex-1 min-w-[100px] p-3 rounded-xl border-2 transition-all ${
                  selectedPricingType === pricing.type
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex flex-col items-center gap-0.5" dir="ltr">
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-gray-900">
                      {pricing.rate.toLocaleString()}
                    </span>
                    <span className="text-xs font-medium text-gray-500">
                      MRU
                    </span>
                  </div>
                  <span className="text-xs font-medium text-gray-500">
                    / {pricing.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedPricingType === "daily" ? (
        <DatePicker
          startDate={startDate}
          endDate={endDate}
          onDateChange={(start, end) => {
            setStartDate(start)
            setEndDate(end)
            if (start && end) {
              const days =
                Math.ceil(
                  (new Date(end).getTime() - new Date(start).getTime()) /
                    (1000 * 60 * 60 * 24)
                ) + 1
              setUsage(days)
            }
          }}
          label={t("rentalPeriod")}
          required
          showRange
          bookedRanges={bookedRanges}
        />
      ) : (
        <>
          <DatePicker
            startDate={startDate}
            endDate=""
            onDateChange={(start) => {
              setStartDate(start)
              setEndDate("")
            }}
            label={t("startDate")}
            required
            showRange={false}
            bookedRanges={bookedRanges}
          />
          <Input
            type="text"
            label={`${
              selectedPricingType === "per_km"
                ? t("estimatedDistance")
                : t("usage")
            } (${usageLabel})`}
            value={usage}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "")
              setUsage(val ? Number(val) : 0)
            }}
            required
          />
          {selectedPricingType === "per_km" && (
            <div className="-mt-2 text-sm text-gray-600">
              {t("rate")}:{" "}
              <span dir="ltr">
                {rate.toLocaleString()} MRU/{usageLabel}
              </span>
            </div>
          )}
        </>
      )}

      <PriceCalculation
        rate={rate}
        unit={usageLabel}
        usage={usage}
        subtotal={subtotal}
      />
    </BaseRequestModal>
  )
}
