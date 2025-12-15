"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { toast } from "sonner"
import { usePriceFormatter } from "@/src/hooks/usePriceFormatter"
import { useFontClass } from "@/src/hooks/useFontClass"
import { useCityData } from "@/src/hooks/useCityData"
import { getEquipmentImage } from "@/src/lib/equipment-images"
import Button from "../ui/Button"
import BookingModal from "../booking/BookingModal"
import SaleModal from "../booking/SaleModal"
import { MapPin, Tag, Clock, Gauge } from "lucide-react"

interface Pricing {
  type?: string
  dailyRate?: number
  hourlyRate?: number
  monthlyRate?: number
  kmRate?: number
  tonRate?: number
  salePrice?: number
}

interface Specifications {
  condition?: string
  brand?: string
  model?: string
  year?: number
  hoursUsed?: number
  kilometersUsed?: number

}

interface Equipment {
  _id: string
  name: string
  description: string
  location: string
  pricing: Pricing
  specifications?: Specifications
  listingType?: string
  forSale?: boolean
  images: string[]
}

interface EquipmentCardProps {
  equipment: Equipment
}

export default function EquipmentCard({ equipment }: EquipmentCardProps) {
  const t = useTranslations("equipment")
  const tDetails = useTranslations("equipmentDetails")
  const router = useRouter()
  const { data: session } = useSession()
  const fontClass = useFontClass()
  const { convertToLocalized } = useCityData()
  const { getPriceData, formatPrice } = usePriceFormatter()
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showSaleModal, setShowSaleModal] = useState(false)
  const isForSale = equipment.listingType === "forSale" || equipment.forSale
  const { rate, unit } = getPriceData(equipment.pricing, isForSale)
  const { displayPrice, displayUnit } = formatPrice(rate, unit)

  const specs = equipment.specifications
  const tCommon = useTranslations("common")
  const localizedCity = convertToLocalized(equipment.location)

  const handleActionClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!session) {
      router.push("/auth/login")
      return
    }
    if (session.user.role === "admin") {
      toast.error(tDetails("adminCannotBook"))
      return
    }
    isForSale ? setShowSaleModal(true) : setShowBookingModal(true)
  }

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full border ${
        isForSale
          ? "border-amber-400 ring-2 ring-amber-400/30"
          : "border-gray-100 hover:border-primary/20"
      } group ${fontClass}`}
    >
      <div
        className="h-52 sm:h-56 md:h-64 lg:h-56 relative overflow-hidden cursor-pointer"
        onClick={() => router.push(`/equipment/${equipment._id}`)}
      >
        <Image
          src={
            equipment.images?.length > 0
              ? equipment.images[0]
              : getEquipmentImage(equipment.name)
          }
          alt={equipment.name}
          fill
          className="object-cover bg-gray-50"
        />
        {isForSale && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {t("forSale")}
          </div>
        )}
      </div>
      <div className="p-5 sm:p-6 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-3 leading-snug line-clamp-2">
            {equipment.name}
          </h3>
          {specs && (specs.brand || specs.model || specs.year) && (
            <div className="mb-2">
              <div className="px-2 py-1 bg-gray-50 rounded-md inline-block">
                <span className="text-xs font-bold text-gray-800">
                  {specs.brand}
                </span>
                {specs.model && (
                  <span className="text-xs text-gray-600 ml-1">
                    • {specs.model}
                  </span>
                )}
                {specs.year && (
                  <span className="text-xs text-gray-600 ml-1">
                    • {specs.year}
                  </span>
                )}
              </div>
              {(specs.hoursUsed || specs.kilometersUsed) && (
                <div className="flex items-center gap-2 mt-1">
                  {specs.hoursUsed && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-md">
                      <Clock className="w-3 h-3 text-blue-600" />
                      <span className="text-xs font-semibold text-blue-700">
                        {specs.hoursUsed.toLocaleString()}h
                      </span>
                    </div>
                  )}
                  {specs.kilometersUsed && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 rounded-md">
                      <Gauge className="w-3 h-3 text-green-600" />
                      <span className="text-xs font-semibold text-green-700">
                        {specs.kilometersUsed.toLocaleString()} km
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm text-gray-600 capitalize">
              {localizedCity}
            </span>
            {specs?.condition && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-600">{specs.condition}</span>
              </>
            )}
          </div>
        </div>
        <div className="space-y-3 mt-auto border-t border-gray-50 pt-4">
          {!isForSale && (
            <div className="flex items-center justify-around gap-2">
              {equipment.pricing.hourlyRate && (
                <div className="text-center">
                  <span className="text-base font-bold text-primary" dir="ltr">
                    {equipment.pricing.hourlyRate.toLocaleString()} MRU
                  </span>
                  <span className="text-xs text-gray-500">
                    /{tCommon("hour")}
                  </span>
                </div>
              )}
              {equipment.pricing.dailyRate && (
                <div className="text-center">
                  <span className="text-base font-bold text-primary" dir="ltr">
                    {equipment.pricing.dailyRate.toLocaleString()} MRU
                  </span>
                  <span className="text-xs text-gray-500">
                    /{tCommon("day")}
                  </span>
                </div>
              )}
            </div>
          )}
          {isForSale && (
            <div className="text-center">
              <div className="text-lg font-bold text-primary" dir="ltr">
                {displayPrice}
              </div>
              <div className="text-xs text-gray-500">{t("salePrice")}</div>
            </div>
          )}

          <Button
            variant="card-primary"
            size="card"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/equipment/${equipment._id}`)
            }}
          >
            {t("viewDetails")}
          </Button>
        </div>
      </div>

      {isForSale ? (
        <SaleModal
          isOpen={showSaleModal}
          onClose={() => setShowSaleModal(false)}
          equipment={equipment}
          buyerId={session?.user?.id || ""}
        />
      ) : (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          equipment={equipment}
        />
      )}
    </div>
  )
}
