"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, Truck, ArrowRight, Calendar, Package } from "lucide-react"
import Link from "next/link"
import EquipmentCard from "@/src/components/equipment/EquipmentCard"
import { requiresTransport } from "@/src/lib/constants/transport"

export default function BookingSuccessPage() {
  const t = useTranslations("bookingSuccess")
  const tCommon = useTranslations("common")
  const router = useRouter()
  const searchParams = useSearchParams()
  const equipmentName = searchParams.get("equipment")
  const type = searchParams.get("type") || "booking"
  const [porteChars, setPorteChars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const needsTransport = equipmentName ? requiresTransport(equipmentName) : false

  useEffect(() => {
    if (needsTransport) {
      fetchPorteChars()
    } else {
      setLoading(false)
    }
  }, [needsTransport])

  const fetchPorteChars = async () => {
    try {
      const response = await fetch("/api/equipment/available-transport")
      const data = await response.json()
      if (data.success) {
        setPorteChars(data.equipment || [])
      }
    } catch (error) {
      console.error("Failed to fetch porte-chars:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Success Message */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-20 h-20 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {t("title")}
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            {type === "sale" ? t("saleMessage") : t("bookingMessage")}
          </p>
          {equipmentName && (
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg">
              <Package className="w-5 h-5" />
              <span className="font-medium">{equipmentName}</span>
            </div>
          )}
        </div>

        {/* Transport Section */}
        {needsTransport && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-3 rounded-full">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {t("transportTitle")}
                </h2>
                <p className="text-gray-600">{t("transportSubtitle")}</p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-600 mt-4">{tCommon("loading")}</p>
              </div>
            ) : porteChars.length > 0 ? (
              <div className="relative">
                <div className="overflow-x-auto pb-4 -mx-4 px-4">
                  <div className="flex gap-4 min-w-max">
                    {porteChars.map((equipment) => (
                      <div key={equipment._id} className="w-80 flex-shrink-0">
                        <EquipmentCard equipment={equipment} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600">
                {t("noTransportAvailable")}
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/bookings"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary/20 transition-colors">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t("myBookings")}
                  </h3>
                  <p className="text-sm text-gray-600">{t("viewBookings")}</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          <Link
            href="/equipment"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-amber-100 p-3 rounded-full group-hover:bg-amber-200 transition-colors">
                  <Package className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t("moreEquipment")}
                  </h3>
                  <p className="text-sm text-gray-600">{t("browseEquipment")}</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
