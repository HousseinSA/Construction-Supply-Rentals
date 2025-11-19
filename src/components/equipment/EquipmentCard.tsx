import Image from "next/image"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { usePriceFormatter } from "@/src/hooks/usePriceFormatter"
import { useFontClass } from "@/src/hooks/useFontClass"
import { useCityData } from "@/src/hooks/useCityData"
import { getEquipmentImage } from "@/src/lib/equipment-images"
import Button from "../ui/Button"
import { MapPin, Tag } from "lucide-react"

interface Pricing {
  dailyRate?: number
  hourlyRate?: number
  kmRate?: number
}

interface Equipment {
  _id: string
  name: string
  description: string
  location: string
  pricing: Pricing
  listingType?: string
  forSale?: boolean
  images: string[]
}

interface EquipmentCardProps {
  equipment: Equipment
}

export default function EquipmentCard({ equipment }: EquipmentCardProps) {
  const t = useTranslations("equipment")
  const router = useRouter()
  const fontClass = useFontClass()
  const { convertToLocalized } = useCityData()
  const { getPriceData, formatPrice } = usePriceFormatter()
  const isForSale = equipment.listingType === "forSale" || equipment.forSale
  const { rate, unit } = getPriceData(equipment.pricing, isForSale)
  const { displayPrice, displayUnit } = formatPrice(rate, unit)

  const localizedCity = convertToLocalized(equipment.location)

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full border ${
        isForSale
          ? "border-amber-400 ring-2 ring-amber-400/30"
          : "border-gray-100 hover:border-primary/20"
      } group cursor-pointer ${fontClass}`}
      onClick={() => router.push(`/equipment/${equipment._id}`)}
    >
      <div className="h-48 relative overflow-hidden">
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
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="text-base font-medium text-gray-800 mb-1.5 leading-tight">
            {equipment.name}
          </h3>
          <p className="text-sm text-gray-500 mb-2 leading-snug line-clamp-1">
            {equipment.description}
          </p>
          <div className="flex items-center capitalize text-sm text-gray-500">
            <MapPin className="w-2 h-2 sm:w-4 sm:h-4 mx-0.5  text-primary" />
            {localizedCity}
          </div>
        </div>
        <div className="space-y-2.5 mt-auto border-t border-gray-50">
          <div className="text-center mb-2">
            <div className="text-lg font-semibold text-primary" dir="ltr">
              {displayPrice}
            </div>
            <div className="text-xs text-gray-400 font-medium">
              {isForSale ? t("salePrice") : displayUnit}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="card-secondary"
              size="card"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/equipment/${equipment._id}`)
              }}
            >
              {t("viewDetails")}
            </Button>
            <Button
              variant="card-primary"
              size="card"
              className="flex-1"
              onClick={(e) => e.stopPropagation()}
            >
              {isForSale ? t("buyNow") : t("rentNow")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
