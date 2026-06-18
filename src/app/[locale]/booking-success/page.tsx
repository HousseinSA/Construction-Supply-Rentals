"use client"

import { useTranslations } from "next-intl"
import { useBookingSuccess } from "@/src/hooks/useBookingSuccess"
import BookingSuccessContent from "@/src/components/booking/BookingSuccessContent"

export default function BookingSuccessPage() {
  const t = useTranslations("bookingSuccess")
  const {
    equipmentName,
    type,
    mainEquipment,
    mainLoading,
    needsTransport,
    relatedEquipment,
    relatedHasMore,
    relatedLoadingMore,
    loadMoreRelated,
    transportEquipment,
    transportHasMore,
    transportLoadingMore,
    loadMoreTransport,
  } = useBookingSuccess()

  return (
    <BookingSuccessContent
      t={t}
      type={type}
      mainLoading={mainLoading}
      mainEquipment={mainEquipment}
      equipmentName={equipmentName}
      needsTransport={needsTransport}
      relatedEquipment={relatedEquipment}
      relatedHasMore={relatedHasMore}
      relatedLoadingMore={relatedLoadingMore}
      onLoadMoreRelated={loadMoreRelated}
      transportEquipment={transportEquipment}
      transportHasMore={transportHasMore}
      transportLoadingMore={transportLoadingMore}
      onLoadMoreTransport={loadMoreTransport}
    />
  )
}
