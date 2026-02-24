"use client"

import EquipmentList from "./EquipmentList"

interface EquipmentContentProps {
  loading: boolean
  equipment: any[]
  updating: string | null
  navigating: string | null
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onStatusChange: (id: string, action: "approve" | "reject") => void
  onAvailabilityChange: (id: string, isAvailable: boolean) => void
  onNavigate: (url: string, id: string) => void
  onPageChange: (page: number) => void
  onPricingReview: (item: any) => void
  isSupplier: boolean
  t: any
}

export default function EquipmentContent({
  loading,
  equipment,
  updating,
  navigating,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onStatusChange,
  onAvailabilityChange,
  onNavigate,
  onPageChange,
  onPricingReview,
  isSupplier,
  t,
}: EquipmentContentProps) {
  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-pulse text-gray-600 font-medium">{t("loading")}</div>
      </div>
    )
  }

  if (equipment.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500 font-medium">
        {t("noEquipmentFound")}
      </div>
    )
  }

  return (
    <EquipmentList
      equipment={equipment}
      updating={updating}
      navigating={navigating}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      onStatusChange={onStatusChange}
      onAvailabilityChange={onAvailabilityChange}
      onNavigate={onNavigate}
      onPageChange={onPageChange}
      onPricingReview={onPricingReview}
      t={t}
      isSupplier={isSupplier}
    />
  )
}
