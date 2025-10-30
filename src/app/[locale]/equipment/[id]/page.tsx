"use client"

import { useParams } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"
import { useState, useEffect } from "react"
import Image from "next/image"
import { usePriceFormatter } from "@/src/hooks/usePriceFormatter"
import { useFontClass } from "@/src/hooks/useFontClass"
import { useCityData } from "@/src/hooks/useCityData"

export default function EquipmentDetailsPage() {
  const params = useParams()
  const locale = useLocale()
  const t = useTranslations("equipment")
  const tCommon = useTranslations("common")
  const [equipment, setEquipment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const equipmentId = params.id as string
  const fontClass = useFontClass()
  const { convertToLocalized } = useCityData()

  const { getPriceData, formatPrice } = usePriceFormatter()

  const getFormattedPrice = (pricing: any) => {
    const { rate, unit } = getPriceData(pricing)
    const { displayPrice, displayUnit } = formatPrice(rate, unit)
    return `${displayPrice} ${displayUnit}`
  }

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await fetch(`/api/equipment/${equipmentId}`)
        const data = await response.json()
        if (data.success) {
          setEquipment(data.data)
        }
      } catch (error) {
        console.error("Failed to fetch equipment:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchEquipment()
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

  if (!equipment) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${fontClass}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("equipmentNotFound")}</h3>
          <p className="text-gray-600">{t("equipmentNotFoundDesc")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${fontClass}`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="md:flex">
            {/* Image Section */}
            <div className="md:w-1/2">
              <div className="h-96 relative">
                <Image
                  src="/equipement-images/Pelle hydraulique.jpg"
                  alt={equipment.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            
            {/* Details Section */}
            <div className="md:w-1/2 p-6">
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{equipment.name}</h1>
                  <p className="text-gray-600">{equipment.description}</p>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {convertToLocalized(equipment.location)}
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("pricing")}</h3>
                  <div className="text-2xl font-bold text-primary" dir="ltr">
                    {getFormattedPrice(equipment.pricing)}
                  </div>
                </div>

                {equipment.specifications && Object.keys(equipment.specifications).length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("specifications")}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(equipment.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600">{key}:</span>
                          <span className="font-medium">{value as string}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-50 pt-4 space-y-3">
                  <button className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-xl transition-all duration-200 font-medium shadow-sm">
                    {t("rentNow")}
                  </button>
                  <button 
                    onClick={() => window.history.back()}
                    className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 py-3 px-6 rounded-xl transition-all duration-200 font-medium"
                  >
                    {t("goBack")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}