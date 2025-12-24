"use client"

import { useTranslations } from "next-intl"
import { useSession } from "next-auth/react"
import { Link } from "@/src/i18n/navigation"
import { ArrowLeft } from "lucide-react"
import { useFontClass } from "@/src/hooks/useFontClass"
import { useEquipmentForm } from "@/src/hooks/useEquipmentForm"
import AuthCard from "../auth/AuthCard"
import ListingTypeSelector from "../equipment/ListingTypeSelector"
import EquipmentFormFields from "../equipment/EquipmentFormFields"
import FormActions from "../equipment/FormActions"
import CommissionStructure from "../ui/CommissionStructure"

export default function CreateEquipmentForm() {
  const { data: session } = useSession()
  const t = useTranslations("dashboard.equipment")
  const fontClass = useFontClass()
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
  } = useEquipmentForm()

  return (
    <div
      className={`min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ${fontClass}`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Link
                href="/dashboard"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-primary">
                  {t("createTitle")}
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <AuthCard>
            <form onSubmit={handleSubmit} className="space-y-6">
              <ListingTypeSelector
                value={formData.listingType}
                onChange={handleListingTypeChange}
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
              />

              <FormActions isSubmitting={isSubmitting} />
            </form>
          </AuthCard>
          {session?.user?.userType === "supplier" && (
            <CommissionStructure variant="compact" />
          )}
        </div>
      </div>
    </div>
  )
}
