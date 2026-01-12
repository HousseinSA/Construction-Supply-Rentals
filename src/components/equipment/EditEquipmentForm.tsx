"use client"

import { useEffect } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/src/i18n/navigation"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import { useFontClass } from "@/src/hooks/useFontClass"
import { useEquipmentForm } from "@/src/hooks/useEquipmentForm"
import { useSession } from "next-auth/react"
import AuthCard from "../auth/AuthCard"
import ListingTypeSelector from "./ListingTypeSelector"
import EquipmentFormFields from "./EquipmentFormFields"
import FormActions from "./FormActions"
import PendingPricingBanner from "./PendingPricingBanner"
import PricingRejectionBanner from "./PricingRejectionBanner"

interface EditEquipmentFormProps {
  equipmentId: string
}

export default function EditEquipmentForm({ equipmentId }: EditEquipmentFormProps) {
  const t = useTranslations("dashboard.equipment")
  const fontClass = useFontClass()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "admin"
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
    ownershipError,
    loading,
    hasChanges,
  } = useEquipmentForm(equipmentId)

  useEffect(() => {
    if (equipmentId) {
      loadEquipment()
    }
  }, [equipmentId])

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${fontClass}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">{t("loading")}</p>
        </div>
      </div>
    )
  }

  if (ownershipError) {
    return (
      <div className={`min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ${fontClass}`}>
        <div className="max-w-4xl mx-auto">
          <AuthCard>
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Access Denied
              </h3>
              <p className="text-gray-600 mb-6">
                You don't have permission to edit this equipment.
              </p>
              <Link
                href="/dashboard/equipment"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Equipment
              </Link>
            </div>
          </AuthCard>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ${fontClass}`}>
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
                <h1 className="text-2xl font-bold text-primary">{t("editTitle")}</h1>
              </div>
            </div>
          </div>
        </div>

        <AuthCard>
          {hasActiveBookings ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t("cannotEditActiveBooking")}
              </h3>
              <p className="text-gray-600">
                This equipment has active bookings and cannot be edited at this time.
              </p>
            </div>
          ) : (
            <>
              {!isAdmin && equipment?.pendingPricing && (
                <PendingPricingBanner
                  currentPricing={equipment.pricing}
                  pendingPricing={equipment.pendingPricing}
                  listingType={equipment.listingType}
                />
              )}
              {!isAdmin && equipment?.pricingRejectionReason && (
                <PricingRejectionBanner
                  rejectionReason={equipment.pricingRejectionReason}
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
              equipmentCreatedBy={equipment?.createdBy}
              hasPendingPricing={!!equipment?.pendingPricing}
              isEditMode={true}
              hasActiveBookings={hasActiveBookings}
            />
                <FormActions isSubmitting={isSubmitting} isEdit hasChanges={hasChanges} />
              </form>
            </>
          )}
        </AuthCard>
      </div>
    </div>
  )
}
