"use client"

import { useEffect } from "react"
import { useTranslations } from "next-intl"
import { Link, useRouter } from "@/src/i18n/navigation"
import { ArrowLeft } from "lucide-react"
import { useFontClass } from "@/src/hooks/useFontClass"
import { useEquipmentForm } from "@/src/hooks/equipment/useEquipmentForm"
import { useSession } from "next-auth/react"
import { useEquipmentStore } from "@/src/stores/equipmentStore"
import PageLoading from "../ui/PageLoading"
import AuthCard from "../auth/AuthCard"
import ListingTypeSelector from "./ListingTypeSelector"
import EquipmentFormFields from "./EquipmentFormFields"
import FormActions from "./FormActions"
import PendingPricingBanner from "./banners/PendingPricingBanner"
import PricingRejectionBanner from "./banners/PricingRejectionBanner"
import EquipmentRejectionBanner from "./banners/EquipmentRejectionBanner"

interface EditEquipmentFormProps {
  equipmentId: string
}

export default function EditEquipmentForm({
  equipmentId,
}: EditEquipmentFormProps) {
  const t = useTranslations("dashboard.equipment")
  const fontClass = useFontClass()
  const router = useRouter()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "admin"
  const resetNavigating = useEquipmentStore((state) => state.resetNavigating)
  const {
    formData,
    images,
    isSubmitting,
    setImages,
    handleInputChange,
    handleNumericInputChange,
    handleCategoryChange,
    handleTypeChange,
    handleLocationChange,
    handleListingTypeChange,
    handleConditionChange,
    handleWeightUnitChange,
    handleUsageUnitChange,
    handleSubmit,
    loadEquipment,
    equipment,
    hasActiveBookings,
    loading,
    hasChanges,
  } = useEquipmentForm(equipmentId)

  useEffect(() => {
    resetNavigating()
  }, [])

  useEffect(() => {
    if (equipmentId) {
      loadEquipment()
    }
  }, [equipmentId])

  useEffect(() => {
    if (!loading && hasActiveBookings) {
      router.back()
    }
  }, [loading, hasActiveBookings, router])

  if (loading) {
    return <PageLoading message={t("loading")} className={fontClass} />
  }

  return (
    <div
      className={`min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ${fontClass}`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Link
                href="/dashboard/equipment"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-primary">
                  {t("editTitle")}
                </h1>
              </div>
            </div>
          </div>
        </div>

        <AuthCard>
          {!isAdmin && equipment?.status === "rejected" && equipment?.rejectionReason && (
            <EquipmentRejectionBanner
              rejectionReason={equipment.rejectionReason}
            />
          )}
          {!isAdmin && equipment?.pendingPricing && (
            <PendingPricingBanner
              currentPricing={equipment.pricing}
              pendingPricing={equipment.pendingPricing}
              listingType={equipment.listingType}
            />
          )}
          {!isAdmin &&
            equipment?.rejectedPricingValues &&
            Object.keys(equipment.rejectedPricingValues).length > 0 &&
            (
              <PricingRejectionBanner
                pricingRejectionReasons={equipment.pricingRejectionReasons}
                rejectedPricingValues={equipment.rejectedPricingValues}
                currentPricing={equipment.pricing}
                listingType={equipment.listingType}
                pendingPricing={equipment.pendingPricing}
              />
            )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <ListingTypeSelector
              value={formData.listingType}
              onChange={handleListingTypeChange}
              disabled={true}
            />
            <EquipmentFormFields
              formData={formData}
              images={images}
              isSubmitting={isSubmitting}
              onInputChange={handleInputChange}
              onNumericInputChange={handleNumericInputChange}
              onCategoryChange={handleCategoryChange}
              onTypeChange={handleTypeChange}
              onLocationChange={handleLocationChange}
              onConditionChange={handleConditionChange}
              onWeightUnitChange={handleWeightUnitChange}
              onUsageUnitChange={handleUsageUnitChange}
              onImagesChange={setImages}
              isAdmin={isAdmin}
              isEditMode={true}
            />
            <FormActions
              isSubmitting={isSubmitting}
              isEdit
              hasChanges={hasChanges}
            />
          </form>
        </AuthCard>
      </div>
    </div>
  )
}
