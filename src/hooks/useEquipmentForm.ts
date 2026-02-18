import { useState } from "react"
import { useRouter } from "@/src/i18n/navigation"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { useEquipmentStore } from "@/src/stores/equipmentStore"

export interface UploadedImage {
  url: string
  public_id: string
}

interface FormData {
  category: string
  type: string
  location: string
  listingType: "forSale" | "forRent"
  hourlyRate: string
  dailyRate: string
  monthlyRate: string
  kmRate: string
  tonRate: string
  salePrice: string
  description: string
  brand: string
  model: string
  year: string
  condition: string
  usageValue: string
  usageUnit: string
  weight: string
  weightUnit: string
}

export function useEquipmentForm(equipmentId?: string) {
  const router = useRouter()
  const tToast = useTranslations("toast")
  const { invalidateCache } = useEquipmentStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<UploadedImage[]>([])
  const [equipment, setEquipment] = useState<any>(null)
  const [hasActiveBookings, setHasActiveBookings] = useState(false)
  const [ownershipError, setOwnershipError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [initialFormData, setInitialFormData] = useState<FormData | null>(null)
  const [initialImages, setInitialImages] = useState<UploadedImage[]>([])
  const [formData, setFormData] = useState<FormData>({
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
  })

  const loadEquipment = async () => {
    if (!equipmentId) return
    try {
      setLoading(true)
      const response = await fetch(`/api/equipment/${equipmentId}?admin=true`)
      const data = await response.json()
      if (!data.success) {
        setOwnershipError(true)
        setLoading(false)
        return
      }

      const eq = data.data
      setEquipment(eq)
      setHasActiveBookings(eq.hasActiveBookings || false)
      const usageValue = eq.specifications?.hoursUsed
        ? String(eq.specifications.hoursUsed)
        : eq.specifications?.kilometersUsed
          ? String(eq.specifications.kilometersUsed)
          : eq.specifications?.tonnageUsed
            ? String(eq.specifications.tonnageUsed)
            : ""
      const loadedFormData = {
        category: eq.categoryId,
        type: eq.equipmentTypeId,
        location: eq.location,
        listingType: eq.listingType,
        hourlyRate: eq.pricing.hourlyRate ? String(eq.pricing.hourlyRate) : "",
        dailyRate: eq.pricing.dailyRate ? String(eq.pricing.dailyRate) : "",
        monthlyRate: eq.pricing.monthlyRate
          ? String(eq.pricing.monthlyRate)
          : "",
        kmRate: eq.pricing.kmRate ? String(eq.pricing.kmRate) : "",
        tonRate: eq.pricing.tonRate ? String(eq.pricing.tonRate) : "",
        salePrice: eq.pricing.salePrice ? String(eq.pricing.salePrice) : "",
        description: eq.description || "",
        brand: eq.specifications?.brand || "",
        model: eq.specifications?.model || "",
        year: eq.specifications?.year ? String(eq.specifications.year) : "",
        condition: eq.specifications?.condition || "",
        usageValue,
        usageUnit: eq.specifications?.usageUnit || "hours",
        weight: eq.specifications?.weight
          ? String(eq.specifications.weight)
          : "",
        weightUnit: eq.specifications?.weightUnit || "kg",
      }
      setFormData(loadedFormData)
      setInitialFormData(loadedFormData)
      const loadedImages = eq.images.map((url: string) => {
        const match = url.match(/\/([^\/]+)\.[^.]+$/)
        const public_id = match ? `equipment/${match[1]}` : ""
        return { url, public_id }
      })
      setImages(loadedImages)
      setInitialImages(loadedImages)
      setLoading(false)
    } catch (error) {
      console.error("Error loading equipment:", error)
      setOwnershipError(true)
      setLoading(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "")
    setFormData({ ...formData, [e.target.name]: val })
  }

  const handleCategoryChange = (value: string) => {
    setFormData({ ...formData, category: value, type: "" })
  }

  const handleTypeChange = (value: string) => {
    setFormData({ ...formData, type: value })
  }

  const handleLocationChange = (value: string) => {
    setFormData({ ...formData, location: value })
  }

  const handleListingTypeChange = (listingType: "forSale" | "forRent") => {
    setFormData({ ...formData, listingType })
  }

  const handleConditionChange = (value: string) => {
    setFormData({ ...formData, condition: value })
  }

  const handleWeightUnitChange = (value: string) => {
    setFormData({ ...formData, weightUnit: value })
  }

  const handleUsageUnitChange = (value: string) => {
    setFormData({ ...formData, usageUnit: value })
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
    if (formData.listingType === "forSale") {
      if (!formData.salePrice || parseFloat(formData.salePrice) <= 0) {
        toast.error(tToast("priceRequired"))
        return false
      }
      if (!formData.condition) {
        toast.error(tToast("conditionRequired"))
        return false
      }
    } else {
      const hasAnyPrice =
        formData.hourlyRate ||
        formData.dailyRate ||
        formData.kmRate ||
        formData.tonRate
      if (!hasAnyPrice) {
        toast.error(tToast("priceRequired"))
        return false
      }
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
        pricing.salePrice = parseFloat(formData.salePrice)
      } else {
        if (formData.hourlyRate)
          pricing.hourlyRate = parseFloat(formData.hourlyRate)
        if (formData.dailyRate)
          pricing.dailyRate = parseFloat(formData.dailyRate)
        if (formData.monthlyRate)
          pricing.monthlyRate = parseFloat(formData.monthlyRate)
        if (formData.kmRate) pricing.kmRate = parseFloat(formData.kmRate)
        if (formData.tonRate) pricing.tonRate = parseFloat(formData.tonRate)
      }

      const specifications: any = {
        brand: formData.brand.trim(),
        ...(formData.model && { model: formData.model.trim() }),
        ...(formData.year && { year: parseInt(formData.year) }),
        ...(formData.condition && { condition: formData.condition }),
        ...(formData.weight && {
          weight: parseFloat(formData.weight),
          weightUnit: formData.weightUnit,
        }),
      }

      if (formData.usageValue) {
        const usageNum = parseInt(formData.usageValue)
        specifications.usageUnit = formData.usageUnit

        if (formData.usageUnit === "hours") {
          specifications.hoursUsed = usageNum
        } else if (formData.usageUnit === "km") {
          specifications.kilometersUsed = usageNum
        } else if (formData.usageUnit === "tons") {
          specifications.tonnageUsed = usageNum
        }
      }

      const equipmentData: any = {
        description: formData.description.trim(),
        categoryId: formData.category,
        equipmentTypeId: formData.type,
        location: formData.location,
        images: images.map((img) => img.url),
        specifications,
        listingType: formData.listingType,
      }

      if (equipmentId && equipment) {
        const normalizePricing = (p: any) => {
          const normalized: any = {}
          if (p.hourlyRate)
            normalized.hourlyRate = parseFloat(String(p.hourlyRate))
          if (p.dailyRate)
            normalized.dailyRate = parseFloat(String(p.dailyRate))
          if (p.monthlyRate)
            normalized.monthlyRate = parseFloat(String(p.monthlyRate))
          if (p.kmRate) normalized.kmRate = parseFloat(String(p.kmRate))
          if (p.tonRate) normalized.tonRate = parseFloat(String(p.tonRate))
          if (p.salePrice)
            normalized.salePrice = parseFloat(String(p.salePrice))
          return normalized
        }

        const currentPricing = normalizePricing(equipment.pricing)
        const newPricing = normalizePricing(pricing)
        
        const changedPricing: any = {}
        Object.keys(newPricing).forEach((key) => {
          if (newPricing[key] !== currentPricing[key]) {
            changedPricing[key] = newPricing[key]
          }
        })
        
        if (Object.keys(changedPricing).length > 0) {
          equipmentData.pricing = changedPricing
        }
      } else {
        equipmentData.pricing = pricing
      }

      const url = equipmentId
        ? `/api/equipment/${equipmentId}`
        : "/api/equipment"
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
        if (result.errorCode) {
          throw new Error(tToast(result.errorCode))
        }
        throw new Error(
          result.error ||
            `Failed to ${equipmentId ? "update" : "create"} equipment`,
        )
      }

      toast.success(
        tToast(equipmentId ? "equipmentUpdated" : "equipmentCreated"),
      )
      if (equipmentId) {
        invalidateCache()
      }
      router.push(equipmentId ? "/dashboard/equipment" : "/dashboard")
    } catch (error) {
      console.error("Equipment creation error:", error)
      toast.error(
        error instanceof Error
          ? error.message
          : tToast("equipmentCreateFailed"),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasChanges = () => {
    if (!equipmentId || !initialFormData) return true
    const formChanged =
      JSON.stringify(formData) !== JSON.stringify(initialFormData)
    const imagesChanged =
      JSON.stringify(images.map((i) => i.url)) !==
      JSON.stringify(initialImages.map((i) => i.url))
    return formChanged || imagesChanged
  }

  return {
    formData,
    images,
    isSubmitting,
    equipment,
    hasActiveBookings,
    ownershipError,
    loading,
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
    hasChanges: hasChanges(),
  }
}
