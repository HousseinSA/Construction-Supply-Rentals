"use client"

import { useTranslations } from "next-intl"
import { useBookingSuccess } from "@/src/hooks/useBookingSuccess"
import BookingSuccessContent from "@/src/components/booking/BookingSuccessContent"

export default function BookingSuccessPage() {
  const t = useTranslations("bookingSuccess")
  const {
    equipmentName,
    type,
    relatedEquipment,
    mainEquipment,
    mainLoading,
    needsTransport
  } = useBookingSuccess()

  return (
    <BookingSuccessContent
      t={t}
      type={type}
      mainLoading={mainLoading}
      mainEquipment={mainEquipment}
      equipmentName={equipmentName}
      relatedEquipment={relatedEquipment}
      needsTransport={needsTransport}
    />
  )
}
