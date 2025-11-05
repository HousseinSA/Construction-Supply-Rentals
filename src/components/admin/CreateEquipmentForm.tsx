"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/src/i18n/navigation"
import { ArrowLeft, Camera } from "lucide-react"
import { useFontClass } from "@/src/hooks/useFontClass"
import AuthCard from "../auth/AuthCard"
import Input from "../ui/Input"
import Button from "../ui/Button"
import CategoryDropdown from "../ui/CategoryDropdown"
import EquipmentTypeDropdown from "../ui/EquipmentTypeDropdown"
import CityDropdown from "../ui/CityDropdown"
import PricingTypeDropdown from "../ui/PricingTypeDropdown"

export default function CreateEquipmentForm() {
  const t = useTranslations("dashboard.equipment")
  const tCategories = useTranslations("categories")
  const tCommon = useTranslations("common")
  const fontClass = useFontClass()
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    type: "",
    location: "",
    priceType: "hourly",
    price: "",
    description: "",
    specifications: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleCategoryChange = (value: string) => {
    setFormData({ ...formData, category: value, type: "", priceType: "" })
  }

  const handleTypeChange = (value: string) => {
    setFormData({ ...formData, type: value, priceType: "" })
  }

  const handlePriceTypeChange = (value: string) => {
    setFormData({ ...formData, priceType: value })
  }

  const handleLocationChange = (value: string) => {
    setFormData({ ...formData, location: value })
  }



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <div className={`min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ${fontClass}`}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2 rtl:mr-0 rtl:ml-2" />
            {t("backToDashboard")}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("createTitle")}</h1>
          <p className="text-gray-600">{t("createSubtitle")}</p>
        </div>

        <AuthCard>
            <form onSubmit={handleSubmit} className="space-y-6">
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

                <PricingTypeDropdown
                  equipmentType={formData.type}
                  value={formData.priceType}
                  onChange={handlePriceTypeChange}
                />

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
                  {t("images")}
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary transition-colors">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">{t("uploadImages")}</p>
                  <input type="file" multiple accept="image/*" className="hidden" />
                  <Button type="button" variant="secondary">
                    {t("selectImages")}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-4">
                <Link href="/dashboard">
                  <Button type="button" variant="secondary" className="w-full sm:w-auto">
                    {t("cancel")}
                  </Button>
                </Link>
                <Button type="submit" variant="primary" className="w-full sm:w-auto">
                  {t("createEquipment")}
                </Button>
              </div>
            </form>
        </AuthCard>
      </div>
    </div>
  )
}