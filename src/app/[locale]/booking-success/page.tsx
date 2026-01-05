"use client"

import { useEffect, useState, useCallback } from "react"
import { useTranslations } from "next-intl"
import {  useSearchParams } from "next/navigation"
import { CheckCircle, Truck, ArrowRight, Calendar, Package } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import EquipmentCard from "@/src/components/equipment/EquipmentCard"
import { requiresTransport } from "@/src/lib/constants/transport"
import { useBookingSuccessStore } from "@/src/stores/bookingSuccessStore"
import { Equipment } from "@/src/lib/models"

export default function BookingSuccessPage() {
  const t = useTranslations("bookingSuccess")
  const searchParams = useSearchParams()
  const equipmentName = searchParams.get("equipment")
  const equipmentId = searchParams.get("equipmentId")
  const type = searchParams.get("type") || "booking"
  const [relatedEquipment, setRelatedEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [mainEquipment, setMainEquipment] = useState<Equipment | null>(null)
  const [mainLoading, setMainLoading] = useState(false)
  const needsTransport = equipmentName ? requiresTransport(equipmentName) : false
  const storedEquipment = useBookingSuccessStore((state) => state.equipment)
  const clearEquipment = useBookingSuccessStore((state) => state.clearEquipment)

  const fetchMainEquipment = useCallback(async () => {
    try {
      setMainLoading(true)
      const res = await fetch(`/api/equipment/${equipmentId}`)
      const data = await res.json()
      if (data.success) setMainEquipment(data.data)
    } catch (err) {
      console.error('Failed to fetch equipment:', err)
    } finally {
      setMainLoading(false)
    }
  }, [equipmentId])

  const fetchRelatedEquipment = useCallback(async () => {
    try {
      if (needsTransport) {
        const response = await fetch("/api/equipment/available-transport")
        const data = await response.json()
        if (data.success) {
          setRelatedEquipment(data.equipment || [])
        }
      } else if (equipmentId) {
        const response = await fetch(`/api/equipment/related?id=${equipmentId}&limit=6&type=${type}`)
        const data = await response.json()
        if (data.success) {
          setRelatedEquipment(data.equipment || [])
        }
      } else {
        const response = await fetch("/api/equipment?limit=6")
        const data = await response.json()
        if (data.success) {
          setRelatedEquipment(data.data || [])
        }
      }
    } catch (error) {
      console.error("Failed to fetch equipment:", error)
      setRelatedEquipment([])
    } finally {
      setLoading(false)
    }
  }, [equipmentId, needsTransport, type])

  useEffect(() => {
    fetchRelatedEquipment()
  }, [fetchRelatedEquipment])

  useEffect(() => {
    if (equipmentId) {
      if (storedEquipment) {
        setMainEquipment(storedEquipment)
        setMainLoading(false)
      } else {
        fetchMainEquipment()
      }
    }
  }, [equipmentId, storedEquipment, fetchMainEquipment])

  useEffect(() => {
    if (mainEquipment && relatedEquipment.length > 0 && !loading) {
      const timer = setTimeout(() => {
        clearEquipment()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [mainEquipment, relatedEquipment, loading, clearEquipment])
  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 mb-6">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
              <div className="w-full lg:w-1/2 flex justify-center order-2 lg:order-1">
                <div className="w-full max-w-xs sm:max-w-sm lg:max-w-none h-64 sm:h-80 lg:h-96 rounded-lg overflow-hidden bg-gray-100 shadow-md">
                  {mainLoading ? (
                    <div className="w-full h-full bg-gray-200 animate-pulse" />
                  ) : mainEquipment?.images?.[0] ? (
                    <Image
                      src={mainEquipment.images[0]}
                      alt={mainEquipment.name || equipmentName || ''}
                      width={500}
                      height={500}
                      className="w-full h-full object-cover"
                      priority
                    />
                  ) : null}
                </div>
              </div>
              <div className="w-full lg:w-1/2 text-center lg:text-left order-1 lg:order-2">
                <div className="mb-4 flex justify-center lg:justify-start">
                  <CheckCircle className="w-20 sm:w-24 lg:w-28 h-20 sm:h-24 lg:h-28 text-green-500" />
                </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                {type === "sale" ? t("saleTitle") : t("title")}
              </h1>
              <p className="text-base sm:text-lg text-gray-600 mb-6">
                {type === "sale" ? t("saleMessage") : t("bookingMessage")}
              </p>
              {mainEquipment || equipmentName ? (
                <div className="flex items-center justify-center lg:justify-start gap-2 text-primary px-0 py-0 rounded-lg">
                  <Package className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-amber-600 break-words">
                    {mainEquipment?.name || equipmentName}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        {relatedEquipment.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-3 rounded-full">
              {needsTransport ? (
                <Truck className="w-6 h-6 text-blue-600" />
              ) : (
                <Package className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {needsTransport ? t("transportTitle") : t("moreEquipment")}
              </h2>
              <p className="text-sm text-gray-600">
                {needsTransport ? t("transportSubtitle") : t("browseEquipment")}
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-x-auto pb-4 -mx-4 px-4">
              <div className="flex gap-4 min-w-max">
                {relatedEquipment.map((equipment) => {
                  const equipmentForCard = {
                    ...equipment,
                    _id: equipment._id?.toString() || '',
                    supplierId: equipment.supplierId?.toString() || undefined
                  }
                  return (
                    <div key={equipmentForCard._id || Math.random().toString()} className="w-80 flex-shrink-0">
                      <EquipmentCard equipment={equipmentForCard} />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/bookings"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 group"
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
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 group"
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
