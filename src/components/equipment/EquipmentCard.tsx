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
import { getOptimizedCloudinaryUrl, getBlurDataURL } from "@/src/lib/cloudinary-url"
import Button from "../ui/Button"
import BookingModal from "../booking/BookingModal"
import SaleModal from "../booking/SaleModal"
import { MapPin, Tag, Clock, Gauge, Loader2 } from "lucide-react"

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
  supplierId?: string
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
  const [isNavigating, setIsNavigating] = useState(false)
  const isForSale = equipment.listingType === "forSale" || equipment.forSale
  const { rate, unit } = getPriceData(equipment.pricing, isForSale)
  const { displayPrice, displayUnit } = formatPrice(rate, unit)

  const specs = equipment.specifications
  const tCommon = useTranslations("common")
  const localizedCity = convertToLocalized(equipment.location)
  const isOwnEquipment = session?.user?.id === equipment.supplierId

  const handleActionClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!session) {
      const currentPath = `/equipment/${equipment._id}`
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(currentPath)}`)
      return
    }
    if (session.user.role === "admin") {
      toast.error(tDetails("adminCannotBook"))
      return
    }
    if (isOwnEquipment) {
      toast.error(tDetails("cannotBookOwnEquipment"))
      return
    }
    isForSale ? setShowSaleModal(true) : setShowBookingModal(true)
  }



  const handleNavigate = () => {
    setIsNavigating(true)
    router.push(`/equipment/${equipment._id}`)
  }

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full border ${
        isOwnEquipment
          ? "border-blue-300 ring-2 ring-blue-300/30"
          : isForSale
          ? "border-amber-400 ring-2 ring-amber-400/30"
          : "border-gray-100 hover:border-primary/20"
      } group ${fontClass} ${isNavigating ? 'pointer-events-none' : ''}`}
    >
      <div
        className="h-56 sm:h-60 relative overflow-hidden cursor-pointer bg-gradient-to-br from-gray-50 to-gray-100"
        onClick={handleNavigate}
      >
        <Image
          src={
            equipment.images?.length > 0
              ? getOptimizedCloudinaryUrl(equipment.images[0], {
                  width: 600,
                  height: 400,
                  quality: 'auto:good',
                  format: 'auto',
                  crop: 'fit'
                })
              : getEquipmentImage(equipment.name)
          }
          alt={equipment.name}
          fill
          sizes="(max-width: 500px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-center"
          placeholder={equipment.images?.length > 0 ? "blur" : "empty"}
          blurDataURL={equipment.images?.length > 0 ? getBlurDataURL(equipment.images[0]) : undefined}
          loading="lazy"
        />
        {isOwnEquipment && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
            {tDetails("yourEquipment")}
          </div>
        )}
        {!isOwnEquipment && isForSale && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {t("forSale")}
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="text-base font-medium text-gray-800 mb-2 leading-tight line-clamp-1">
            {equipment.name}
          </h3>
          
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="capitalize">{localizedCity}</span>
            </div>
            {specs?.condition && (
              <span className="text-xs text-gray-600 px-2 py-0.5 bg-gray-50 rounded">{tDetails(`conditionLabels.${specs.condition}`)}</span>
            )}
          </div>

          {specs && (specs.brand || specs.model || specs.year || specs.hoursUsed || specs.kilometersUsed) && (
            <div className="flex items-center justify-between gap-2 text-xs text-gray-700 mb-2">
              <div>
                {specs.brand && <span className="font-semibold">{specs.brand}</span>}
                {specs.model && <span className="text-gray-600"> • {specs.model}</span>}
                {specs.year && <span className="text-gray-600"> • {specs.year}</span>}
              </div>
              {(specs.hoursUsed || specs.kilometersUsed) && (
                <div className="flex items-center gap-1.5">
                  {specs.hoursUsed && (
                    <div className="inline-flex items-center gap-0.5">
                      <Clock className="w-3 h-3 text-blue-600" />
                      <span>{specs.hoursUsed.toLocaleString()}h</span>
                    </div>
                  )}
                  {specs.kilometersUsed && (
                    <div className="inline-flex items-center gap-0.5">
                      <Gauge className="w-3 h-3 text-green-600" />
                      <span>{specs.kilometersUsed.toLocaleString()}km</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="space-y-2.5 mt-auto border-t border-gray-100 pt-3">
          {!isForSale && (
            <div className="flex items-baseline justify-around gap-3 text-sm flex-wrap">
              {equipment.pricing.hourlyRate && (
                <div className="flex items-baseline gap-1">
                  <span className="font-bold text-primary" dir="ltr">
                    {equipment.pricing.hourlyRate.toLocaleString()} MRU
                  </span>
                  <span className="text-xs text-gray-500">/{tCommon("hour")}</span>
                </div>
              )}
              {equipment.pricing.dailyRate && (
                <div className="flex items-baseline gap-1">
                  <span className="font-bold text-primary" dir="ltr">
                    {equipment.pricing.dailyRate.toLocaleString()} MRU
                  </span>
                  <span className="text-xs text-gray-500">/{tCommon("day")}</span>
                </div>
              )}
              {equipment.pricing.kmRate && (
                <div className="flex items-baseline gap-1">
                  <span className="font-bold text-primary" dir="ltr">
                    {equipment.pricing.kmRate.toLocaleString()} MRU
                  </span>
                  <span className="text-xs text-gray-500">/{tCommon("km")}</span>
                </div>
              )}
            </div>
          )}
          {isForSale && (
            <div className="text-center">
              <div className="text-base font-bold text-primary" dir="ltr">
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
              handleNavigate()
            }}
            disabled={isNavigating}
          >
            {isNavigating ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t("loading")}</span>
              </div>
            ) : (
              t("viewDetails")
            )}
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
