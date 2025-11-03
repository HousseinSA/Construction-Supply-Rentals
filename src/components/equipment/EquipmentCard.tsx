import Image from "next/image"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { usePriceFormatter } from "@/src/hooks/usePriceFormatter"
import { useFontClass } from "@/src/hooks/useFontClass"
import { useCityData } from "@/src/hooks/useCityData"

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
    <div className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-100 hover:border-primary/20 group cursor-pointer ${fontClass}`}
         onClick={() => router.push(`/equipment/${equipment._id}`)}>
      <div className="h-52 relative overflow-hidden">
        <Image
          src="/equipement-images/Pelle hydraulique.jpg"
          alt={equipment.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-800 mb-2 leading-snug">
            {equipment.name}
          </h3>
          <p className="text-sm text-gray-500 mb-3 leading-relaxed line-clamp-2">{equipment.description}</p>
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <svg className="w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {localizedCity}
          </div>
        </div>
        <div className="space-y-3 mt-auto pt-3 border-t border-gray-50">
          <div className="text-center">
            <div className="text-xl font-semibold text-primary mb-1" dir="ltr">
              {displayPrice}
            </div>
            <div className="text-xs text-gray-400 font-medium">{displayUnit}</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/equipment/${equipment._id}`)
              }}
              className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
            >
              {t("viewDetails")}
            </button>
            <button 
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-primary hover:bg-primary-dark text-white px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm"
            >
              {t("rentNow")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
