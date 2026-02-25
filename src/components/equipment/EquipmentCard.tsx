"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { usePriceFormatter } from "@/src/hooks/usePriceFormatter"
import { useFontClass } from "@/src/hooks/useFontClass"
import { useCityData } from "@/src/hooks/useCityData"
import Button from "../ui/Button"
import EquipmentImage from "./EquipmentImage"
import PricingDisplay from "./PricingDisplay"
import EquipmentSpecs from "./EquipmentSpecs"
import { MapPin, Loader2 } from "lucide-react"
import type { Equipment } from "@/src/lib/models/equipment"

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
  const [isNavigating, setIsNavigating] = useState(false)
  
  const isForSale = equipment.listingType === "forSale" 
  const { rate, unit } = getPriceData(equipment.pricing, isForSale)
  const { displayPrice } = formatPrice(rate, unit)
  const localizedCity = convertToLocalized(equipment.location)
  const isOwnEquipment = session?.user?.id === equipment.supplierId

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
      <EquipmentImage
        images={equipment.images}
        name={equipment.name}
        isOwnEquipment={isOwnEquipment}
        isForSale={isForSale}
        yourEquipmentLabel={tDetails("yourEquipment")}
        forSaleLabel={t("forSale")}
        onClick={handleNavigate}
      />
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
            {equipment.specifications?.condition && (
              <span className="text-xs text-gray-600 py-0.5 bg-gray-50 rounded">
                {tDetails(`conditionLabels.${equipment.specifications.condition}`)}
              </span>
            )}
          </div>

          <EquipmentSpecs specs={equipment.specifications} />
        </div>
        <div className="space-y-2.5 mt-auto border-t border-gray-100 pt-3">
          <PricingDisplay 
            pricing={equipment.pricing}
            isForSale={isForSale}
            displayPrice={displayPrice}
          />

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
    </div>
  )
}
