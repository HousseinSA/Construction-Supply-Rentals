"use client"

import { useCallback, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Send } from "lucide-react"
import { useTranslations } from "next-intl"
import { useBookingModal } from "@/src/hooks/useBookingModal"
import BaseRequestModal from "@/src/components/shared/BaseRequestModal"
import PricingTypeSelector from "./PricingTypeSelector"
import BookingDateSelector from "./BookingDateSelector"
import BookingUsageInput from "./BookingUsageInput"
import PriceCalculation from "./PriceCalculation"
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
  const params = useParams()
  const router = useRouter()
  const locale = (params?.locale as string) || "fr"

  const {
    message,
    setMessage,
    loading,
    availablePricingTypes,
    selectedPricingType,
    handlePricingTypeChange,
    startDate,
    endDate,
    handleDateChange,
    usage,
    setUsage,
    rate,
    unit,
    subtotal,
    bookedRanges,
    isFormValid,
    handleSubmit,
    resetForm,
  } = useBookingModal(equipment, onBookingSuccess, onClose, router, locale)

  const submitIcon = useMemo(() => <Send className="w-4 h-4" />, [])

  const handleClose = useCallback(() => {
    resetForm()
    onClose()
  }, [resetForm, onClose])

  if (!isOpen || !equipment) return null

  return (
    <BaseRequestModal
      isOpen={isOpen}
      onClose={handleClose}
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
      submitIcon={submitIcon}
      isSubmitDisabled={!isFormValid}
    >
      {availablePricingTypes.length > 1 && (
        <PricingTypeSelector
          types={availablePricingTypes}
          selected={selectedPricingType}
          onChange={handlePricingTypeChange}
          label={t("pricingType")}
        />
      )}

      <BookingDateSelector
        pricingType={selectedPricingType}
        startDate={startDate}
        endDate={endDate}
        onDateChange={handleDateChange}
        bookedRanges={bookedRanges}
        label={t("rentalPeriod")}
        startLabel={t("startDate")}
      />

      {selectedPricingType !== "daily" && (
        <BookingUsageInput
          value={usage}
          onChange={setUsage}
          unit={unit}
          rate={rate}
          pricingType={selectedPricingType}
          distanceLabel={t("estimatedDistance")}
          usageLabel={t("usage")}
          rateLabel={t("rate")}
        />
      )}

      <PriceCalculation
        rate={rate}
        unit={unit}
        usage={usage}
        subtotal={subtotal}
      />
    </BaseRequestModal>
  )
}
