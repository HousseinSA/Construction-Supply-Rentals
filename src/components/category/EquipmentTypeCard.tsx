import Image from "next/image"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { EquipmentType } from "@/src/lib/models"
import { Link } from "@/src/i18n/navigation"
import { useFontClass } from "@/src/hooks/useFontClass"
import { getEquipmentImage } from "@/src/lib/equipment-images"
import Button from "../ui/Button"

interface EquipmentTypeWithCount extends EquipmentType {
  equipmentCount?: number
}

interface EquipmentTypeCardProps {
  type: EquipmentTypeWithCount
  categoryImage: string
  getEquipmentTypeName: (name: string) => string
  getEquipmentTypeDesc: (name: string) => string
}

export default function EquipmentTypeCard({
  type,
  categoryImage,
  getEquipmentTypeName,
  getEquipmentTypeDesc,
}: EquipmentTypeCardProps) {
  const t = useTranslations("categories")
  const fontClass = useFontClass()
  const [isLoading, setIsLoading] = useState(false)
  const hasEquipment = (type.equipmentCount || 0) > 0

  const cardContent = (
    <div className={`bg-white rounded-2xl shadow-sm transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-100 group hover:shadow-md hover:border-primary/20 cursor-pointer ${fontClass}`}>
      <div className="relative w-full aspect-[3/2] bg-gray-50 rounded-t-2xl overflow-hidden">
        <Image
          src={getEquipmentImage(type.name)}
          alt={type.name}
          fill
          className="object-contain scale-120 transition-transform duration-500 ease-out group-hover:scale-125"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="text-base font-medium text-gray-800 mb-1.5 leading-tight">
            {getEquipmentTypeName(type.name)}
          </h3>
          <p className="text-sm text-gray-500 mb-3 leading-snug line-clamp-2">
            {getEquipmentTypeDesc(type.name) ||
              type.description ||
              t("defaultEquipmentDesc")}
          </p>
        </div>
        <div className="flex justify-between items-center mt-auto pt-2.5 border-t border-gray-50">
          <div className="flex items-center space-x-1">
            <span className="text-base font-medium text-primary">
              {type.equipmentCount || 0}
            </span>
            <span className="text-sm text-gray-400">{t("available")}</span>
          </div>
          <Button variant="card-primary" size="card" disabled={isLoading}>
            {isLoading ? t("loading") : t("viewEquipment")}
          </Button>
        </div>
      </div>
    </div>
  )

  if (!hasEquipment) {
    return cardContent
  }

  return (
    <Link href={`/equipment?type=${type._id}`} onClick={() => setIsLoading(true)}>
      {cardContent}
    </Link>
  )
}
