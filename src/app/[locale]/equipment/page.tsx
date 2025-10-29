"use client"

import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useState, useEffect, Suspense } from "react"
import Image from "next/image"

function EquipmentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const t = useTranslations("equipment")
  const tCommon = useTranslations("common")
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const selectedCity = searchParams.get("city")

  const formatPrice = (pricing: any) => {
    if (!pricing) return "0 MRU"
    const rate = pricing.dailyRate || pricing.hourlyRate || pricing.kmRate || 0
    const unit = pricing.dailyRate
      ? tCommon("day")
      : pricing.hourlyRate
      ? tCommon("hour")
      : pricing.kmRate
      ? tCommon("km")
      : tCommon("day")
    return `${rate} MRU/${unit}`
  }

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const params = new URLSearchParams()
        params.set("available", "true") // Only show available equipment
        if (selectedCity) {
          params.set("city", selectedCity)
        }
        const response = await fetch(`/api/equipment?${params.toString()}`)
        const data = await response.json()
        setEquipment(data.data || [])
      } catch (error) {
        console.error("Failed to fetch equipment:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchEquipment()
  }, [selectedCity])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-32 bg-gradient-to-r from-primary to-primary-dark">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 h-full flex items-center justify-center text-center text-white">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {selectedCity
                ? `${t("allEquipment")} - ${selectedCity}`
                : t("allEquipment")}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="h-48 bg-gray-200 animate-pulse" />
                <div className="p-4">
                  <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded mb-4 animate-pulse" />
                  <div className="h-10 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : equipment.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipment.map((item: any) => (
              <div
                key={item._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col"
              >
                <div className="h-48 relative">
                  <Image
                    src="/equipement-images/Pelle hydraulique.jpg"
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 mb-2">{item.description}</p>
                  <p className="text-sm text-gray-500 mb-4">
                    📍 {item.location}
                  </p>
                  <div className="space-y-3 mt-auto">
                    <div className="text-right">
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(item.pricing)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/equipment/${item._id}`)}
                        className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                      >
                        {t("viewDetails")}
                      </button>
                      <button className="flex-1 bg-primary hover:bg-primary-dark text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium">
                        {t("rentNow")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {selectedCity
                ? `${t("noEquipmentInCity")} ${selectedCity}`
                : t("noEquipmentFound")}
            </h3>
            <p className="text-gray-600">
              {selectedCity
                ? `${t("noEquipmentInCityDesc")} ${selectedCity}`
                : t("noEquipmentFoundDesc")}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function EquipmentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-lg">Loading...</div></div>}>
      <EquipmentContent />
    </Suspense>
  )
}
