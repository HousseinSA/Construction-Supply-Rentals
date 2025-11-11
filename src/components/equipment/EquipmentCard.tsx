import Image from "next/image"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { usePriceFormatter } from "@/src/hooks/usePriceFormatter"
import { useFontClass } from "@/src/hooks/useFontClass"
import { useCityData } from "@/src/hooks/useCityData"
import { getEquipmentImage } from "@/src/lib/equipment-images"
import Button from "../ui/Button"

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
  const { rate, unit } = getPriceData(equipment.pricing)
  const { displayPrice, displayUnit } = formatPrice(rate, unit)
  
  const localizedCity = convertToLocalized(equipment.location)

  return (
    <div className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full border ${equipment.forSale ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-gray-100 hover:border-primary/20'} group cursor-pointer ${fontClass}`}
         onClick={() => router.push(`/equipment/${equipment._id}`)}>
      <div className="h-48 relative overflow-hidden">
        <Image
          src={equipment.images?.length > 0 ? equipment.images[0] : getEquipmentImage(equipment.name)}
          alt={equipment.name}
          fill
          className="object-cover bg-gray-50"
        />
        {equipment.forSale && (
          <div className="absolute top-2 right-2 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
            {t("forSale")}
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="text-base font-medium text-gray-800 mb-1.5 leading-tight">
            {equipment.name}
          </h3>
          <p className="text-sm text-gray-500 mb-2 leading-snug line-clamp-1">{equipment.description}</p>
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {localizedCity}
          </div>
        </div>
        <div className="space-y-2.5 mt-auto border-t border-gray-50">
          <div className="text-center mb-2">
            <div className="text-lg font-semibold text-primary" dir="ltr">
              {displayPrice}
            </div>
            <div className="text-xs text-gray-400 font-medium">{displayUnit}</div>
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
              {t("rentNow")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
