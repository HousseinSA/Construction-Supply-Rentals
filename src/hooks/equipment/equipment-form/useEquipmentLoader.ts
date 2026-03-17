import { useRouter } from "@/src/i18n/navigation"
import type { FormData, UploadedImage } from "@/src/lib/equipment-form"
import { loadEquipment, equipmentToFormData, imagesToUploadedImages } from "@/src/lib/equipment-form"
import type { EquipmentWithSupplier } from "@/src/lib/models/equipment"
import { useEquipmentStore } from "@/src/stores/equipmentStore"

export function useEquipmentLoader(
  setFormData: (data: FormData) => void,
  setInitialFormData: (data: FormData) => void,
  setImages: (images: UploadedImage[]) => void,
  setInitialImages: (images: UploadedImage[]) => void,
  setEquipment: (equipment: EquipmentWithSupplier | null) => void,
  setHasActiveBookings: (hasBookings: boolean) => void,
  setLoading: (loading: boolean) => void,
) {
  const router = useRouter()
  const { getEquipmentById } = useEquipmentStore()

  const populateForm = (eq: EquipmentWithSupplier) => {
    setEquipment(eq)
    setHasActiveBookings(eq.hasActiveBookings || false)

    const loadedFormData = equipmentToFormData(eq)
    setFormData(loadedFormData)
    setInitialFormData(loadedFormData)

    const loadedImages = imagesToUploadedImages(eq.images)
    setImages(loadedImages)
    setInitialImages(loadedImages)
  }

  const load = async (equipmentId?: string) => {
    if (!equipmentId) return

    const cachedEquipment = getEquipmentById(equipmentId)
    if (cachedEquipment) {
      populateForm(cachedEquipment)
      return
    }

    setLoading(true)
    try {
      const result = await loadEquipment(equipmentId)

      if (!result.success || !result.data) {
        router.back()
        return
      }

      const eq = result.data
      populateForm(eq)
    } catch (error) {
      console.error("Error loading equipment:", error)
      router.back()
    } finally {
      setLoading(false)
    }
  }

  return { loadEquipment: load }
}
