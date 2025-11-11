"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Link, useRouter } from "@/src/i18n/navigation"
import { ArrowLeft } from "lucide-react"
import { useFontClass } from "@/src/hooks/useFontClass"
import { toast } from "sonner"
import AuthCard from "../auth/AuthCard"
import Input from "../ui/Input"
import Button from "../ui/Button"
import CategoryDropdown from "../ui/CategoryDropdown"
import EquipmentTypeDropdown from "../ui/EquipmentTypeDropdown"
import CityDropdown from "../ui/CityDropdown"
import PricingTypeDropdown from "../ui/PricingTypeDropdown"
import ImageUpload from "../ui/ImageUpload"

export default function CreateEquipmentForm() {
  const t = useTranslations("dashboard.equipment")
  const tToast = useTranslations("toast")
  const fontClass = useFontClass()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    type: "",
    location: "",
    listingType: "forRent" as "forSale" | "forRent",
    priceType: "hourly",
    price: "",
    description: "",
    specifications: "",
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleCategoryChange = (value: string) => {
    setFormData({ ...formData, category: value, type: "", priceType: "" })
  }

  const handleTypeChange = (value: string) => {
    setFormData({
      ...formData,
      type: value,
      priceType: formData.listingType === "forSale" ? "" : "",
    })
  }

  const handlePriceTypeChange = (value: string) => {
    setFormData({ ...formData, priceType: value })
  }

  const handleLocationChange = (value: string) => {
    setFormData({ ...formData, location: value })
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error(tToast("equipmentNameRequired"))
      return false
    }
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
        name: formData.name.trim(),
        description: formData.description.trim(),
        categoryId: formData.category,
        equipmentTypeId: formData.type,
        pricing,
        location: formData.location,
        images,
        specifications: formData.specifications
          ? { notes: formData.specifications.trim() }
          : {},
        listingType: formData.listingType,
      }

      const response = await fetch("/api/equipment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(equipmentData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create equipment")
      }

      toast.success(tToast("equipmentCreated"))
      router.push("/dashboard")
    } catch (error) {
      console.error("Equipment creation error:", error)
      toast.error(
        error instanceof Error ? error.message : tToast("equipmentCreateFailed")
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className={`min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ${fontClass}`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2 rtl:mr-0 rtl:ml-2" />
            {t("backToDashboard")}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("createTitle")}
          </h1>
          <p className="text-gray-600">{t("createSubtitle")}</p>
        </div>

        <AuthCard>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Listing Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                {t("listingType")}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, listingType: "forRent" })
                  }
                  className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                    formData.listingType === "forRent"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        formData.listingType === "forRent"
                          ? "border-primary"
                          : "border-gray-300"
                      }`}
                    >
                      {formData.listingType === "forRent" && (
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">
                        {t("forRent")}
                      </h3>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, listingType: "forSale" })
                  }
                  className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                    formData.listingType === "forSale"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        formData.listingType === "forSale"
                          ? "border-primary"
                          : "border-gray-300"
                      }`}
                    >
                      {formData.listingType === "forSale" && (
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">
                        {t("forSale")}
                      </h3>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label={t("equipmentName")}
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />

              <CategoryDropdown
                value={formData.category}
                onChange={handleCategoryChange}
              />

              <EquipmentTypeDropdown
                category={formData.category}
                value={formData.type}
                onChange={handleTypeChange}
              />

              <CityDropdown
                value={formData.location}
                onChange={handleLocationChange}
              />

              {formData.listingType === "forRent" && formData.type && (
                <PricingTypeDropdown
                  equipmentType={formData.type}
                  value={formData.priceType}
                  onChange={handlePriceTypeChange}
                />
              )}

              <Input
                label={t("price")}
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="5000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("description")}
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all duration-200"
                placeholder={t("descriptionPlaceholder")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("specifications")}
              </label>
              <textarea
                name="specifications"
                value={formData.specifications}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all duration-200"
                placeholder={t("specificationsPlaceholder")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("images")} <span className="text-red-500">*</span>
                <span className="text-sm text-gray-500 ml-2">
                  {t("imageConstraints")}
                </span>
              </label>
              <ImageUpload
                images={images}
                onImagesChange={setImages}
                maxImages={5}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <Link href="/dashboard">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  {t("cancel")}
                </Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                className="w-full sm:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? t("creatingEquipment") : t("createEquipment")}
              </Button>
            </div>
          </form>
        </AuthCard>
      </div>
    </div>
  )
}
