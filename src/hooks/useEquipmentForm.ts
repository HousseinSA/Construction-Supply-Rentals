import { useState } from "react"
import { useRouter } from "@/src/i18n/navigation"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

export interface UploadedImage {
  url: string
  public_id: string
}

interface FormData {
  category: string
  type: string
  location: string
  listingType: "forSale" | "forRent"
  priceType: string
  price: string
  description: string
  brand: string
  model: string
  hoursUsed: string
  weight: string
  weightUnit: string
}

export function useEquipmentForm(equipmentId?: string) {
  const router = useRouter()
  const tToast = useTranslations("toast")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<UploadedImage[]>([])
  const [formData, setFormData] = useState<FormData>({
    category: "",
    type: "",
    location: "",
    listingType: "forRent",
    priceType: "hourly",
    price: "",
    description: "",
    brand: "",
    model: "",
    hoursUsed: "",
    weight: "",
    weightUnit: "kg",
  })

  const loadEquipment = async () => {
    if (!equipmentId) return
    try {
      const response = await fetch(`/api/equipment/${equipmentId}?admin=true`)
      const data = await response.json()
      if (data.success) {
        const eq = data.data
        setFormData({
          category: eq.categoryId,
          type: eq.equipmentTypeId,
          location: eq.location,
          listingType: eq.listingType,
          priceType: eq.pricing.type || "hourly",
          price: String(eq.pricing.salePrice || eq.pricing.hourlyRate || eq.pricing.dailyRate || eq.pricing.kmRate || ""),
          description: eq.description || "",
          brand: eq.specifications?.brand || "",
          model: eq.specifications?.model || "",
          hoursUsed: eq.specifications?.hoursUsed ? String(eq.specifications.hoursUsed) : "",
          weight: eq.specifications?.weight ? String(eq.specifications.weight) : "",
          weightUnit: eq.specifications?.weightUnit || "kg",
        })
        setImages(eq.images.map((url: string) => ({ url, public_id: "" })))
      }
    } catch (error) {
      console.error("Error loading equipment:", error)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleCategoryChange = (value: string) => {
    setFormData({ ...formData, category: value, type: "", priceType: "" })
  }

  const handleTypeChange = (value: string) => {
    setFormData({ ...formData, type: value })
  }

  const handlePriceTypeChange = (value: string) => {
    setFormData({ ...formData, priceType: value })
  }

  const handleLocationChange = (value: string) => {
    setFormData({ ...formData, location: value })
  }

  const handleListingTypeChange = (listingType: "forSale" | "forRent") => {
    setFormData({ ...formData, listingType })
  }





  const handleWeightUnitChange = (value: string) => {
    setFormData({ ...formData, weightUnit: value })
  }



  const validateForm = () => {
    if (!formData.category) {
      toast.error(tToast("categoryRequired"))
      return false
    }
    if (!formData.type) {
      toast.error(tToast("equipmentTypeRequired"))
      return false
    }
    if (!formData.location) {
      toast.error(tToast("locationRequired"))
      return false
    }

    if (!formData.brand.trim()) {
      toast.error(tToast("brandRequired"))
      return false
    }
    if (formData.listingType === "forRent" && !formData.priceType) {
      toast.error(tToast("priceTypeRequired"))
      return false
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error(tToast("priceRequired"))
      return false
    }
    if (images.length === 0) {
      toast.error(tToast("imagesRequired"))
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const pricing: any = {}

      if (formData.listingType === "forSale") {
        pricing.salePrice = parseFloat(formData.price)
      } else {
        switch (formData.priceType) {
          case "hourly":
            pricing.hourlyRate = parseFloat(formData.price)
            break
          case "daily":
            pricing.dailyRate = parseFloat(formData.price)
            break
          case "per_km":
            pricing.kmRate = parseFloat(formData.price)
            break
          case "per_ton":
            pricing.tonRate = parseFloat(formData.price)
            break
        }
        pricing.type = formData.priceType
      }

      const equipmentData = {
        description: formData.description.trim(),
        categoryId: formData.category,
        equipmentTypeId: formData.type,
        pricing,
        location: formData.location,
        images: images.map((img) => img.url),
        specifications: {

          brand: formData.brand.trim(),
          ...(formData.model && { model: formData.model.trim() }),
          ...(formData.hoursUsed && { hoursUsed: parseInt(formData.hoursUsed) }),
          ...(formData.weight && { 
            weight: parseFloat(formData.weight),
            weightUnit: formData.weightUnit 
          }),
        },
        listingType: formData.listingType,

      }

      const url = equipmentId ? `/api/equipment/${equipmentId}` : "/api/equipment"
      const method = equipmentId ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(equipmentData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${equipmentId ? 'update' : 'create'} equipment`)
      }

      toast.success(tToast(equipmentId ? "equipmentUpdated" : "equipmentCreated"))
      router.push("/dashboard/equipment")
    } catch (error) {
      console.error("Equipment creation error:", error)
      toast.error(
        error instanceof Error ? error.message : tToast("equipmentCreateFailed")
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    formData,
    images,
    isSubmitting,
    setImages,
    handleInputChange,
    handleCategoryChange,
    handleTypeChange,
    handlePriceTypeChange,
    handleLocationChange,
    handleListingTypeChange,
    handleWeightUnitChange,
    handleSubmit,
    loadEquipment,
  }
}
