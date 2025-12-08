"use client"

import { useEffect } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/src/i18n/navigation"
import { ArrowLeft } from "lucide-react"
import { useFontClass } from "@/src/hooks/useFontClass"
import { useEquipmentForm } from "@/src/hooks/useEquipmentForm"
import AuthCard from "../auth/AuthCard"
import ListingTypeSelector from "./ListingTypeSelector"
import EquipmentFormFields from "./EquipmentFormFields"
import FormActions from "./FormActions"

interface EditEquipmentFormProps {
  equipmentId: string
}

export default function EditEquipmentForm({ equipmentId }: EditEquipmentFormProps) {
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
    loadEquipment,
  } = useEquipmentForm(equipmentId)

  useEffect(() => {
    if (equipmentId) {
      loadEquipment()
    }
  }, [equipmentId])

  return (
    <div className={`min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ${fontClass}`}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard/equipment" className="inline-flex items-center text-gray-600 hover:text-primary transition-colors mb-4">
            <ArrowLeft className="h-5 w-5 mr-2 rtl:mr-0 rtl:ml-2" />
            {t("backToDashboard")}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("editTitle")}</h1>
          <p className="text-gray-600">{t("editSubtitle")}</p>
        </div>

        <AuthCard>
          <form onSubmit={handleSubmit} className="space-y-6">
            <ListingTypeSelector value={formData.listingType} onChange={handleListingTypeChange} />
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
            <FormActions isSubmitting={isSubmitting} isEdit />
          </form>
        </AuthCard>
      </div>
    </div>
  )
}
