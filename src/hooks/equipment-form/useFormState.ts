import { useState } from "react"
import type { FormData, UploadedImage } from "@/src/lib/equipment-form"
import type { EquipmentWithSupplier } from "@/src/lib/models/equipment"

const defaultFormData: FormData = {
  category: "",
  type: "",
  location: "",
  listingType: "forRent",
  hourlyRate: "",
  dailyRate: "",
  monthlyRate: "",
  kmRate: "",
  tonRate: "",
  salePrice: "",
  description: "",
  brand: "",
  model: "",
  year: "",
  condition: "",
  usageValue: "",
  usageUnit: "hours",
  weight: "",
  weightUnit: "kg",
}

export function useFormState() {
  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [images, setImages] = useState<UploadedImage[]>([])
  const [equipment, setEquipment] = useState<EquipmentWithSupplier | null>(null)
  const [hasActiveBookings, setHasActiveBookings] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [initialFormData, setInitialFormData] = useState<FormData | null>(null)
  const [initialImages, setInitialImages] = useState<UploadedImage[]>([])

  return {
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
  }
}
 