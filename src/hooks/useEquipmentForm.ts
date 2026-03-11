import { useRouter } from "@/src/i18n/navigation"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { useEquipmentStore } from "@/src/stores/equipmentStore"
import { useFormState, useFormHandlers, useEquipmentLoader } from "./equipment-form"
import { validateEquipmentForm, submitEquipment, hasFormChanges } from "@/src/lib/equipment-form"

export interface UploadedImage {
  url: string
  public_id: string
}

export function useEquipmentForm(equipmentId?: string) {
  const router = useRouter()
  const tToast = useTranslations("toast")
  const { invalidateCache } = useEquipmentStore()

  const {
    formData,
    setFormData,
    images,
    setImages,
    equipment,
    setEquipment,
    hasActiveBookings,
    setHasActiveBookings,
    loading,
    setLoading,
    isSubmitting,
    setIsSubmitting,
    initialFormData,
    setInitialFormData,
    initialImages,
    setInitialImages,
  } = useFormState()

  const handlers = useFormHandlers(formData, setFormData)
  const { loadEquipment } = useEquipmentLoader(
    setFormData,
    setInitialFormData,
    setImages,
    setInitialImages,
    setEquipment,
    setHasActiveBookings,
    setLoading,
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEquipmentForm(formData, images, tToast)) return

    setIsSubmitting(true)

    try {
      const result = await submitEquipment(formData, images, equipmentId, equipment || undefined)

      if (!result.success) {
        if (result.errorCode) {
          throw new Error(tToast(result.errorCode))
        }
        throw new Error(
          result.error || `Failed to ${equipmentId ? "update" : "create"} equipment`,
        )
      }

      toast.success(tToast(equipmentId ? "equipmentUpdated" : "equipmentCreated"))
      if (equipmentId) {
        invalidateCache(true)
      }
      router.push("/dashboard/equipment")
    } catch (error) {
      console.error("Equipment creation error:", error)
      toast.error(
        error instanceof Error ? error.message : tToast("equipmentCreateFailed"),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    formData,
    images,
    isSubmitting,
    equipment,
    hasActiveBookings,
    loading,
    setImages,
    ...handlers,
    handleSubmit,
    loadEquipment: () => loadEquipment(equipmentId),
    hasChanges: hasFormChanges(formData, initialFormData, images, initialImages),
  }
}
