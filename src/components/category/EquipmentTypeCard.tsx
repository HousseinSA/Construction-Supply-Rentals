import Image from "next/image"
import { useTranslations } from "next-intl"
import { EquipmentType } from "@/src/lib/models"
import { Link } from "@/src/i18n/navigation"
import { useFontClass } from "@/src/hooks/useFontClass"
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

  return (
    <Link
      href={`/equipment?type=${encodeURIComponent(type.name)}`}
      className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-100 hover:border-primary/20 group cursor-pointer ${fontClass}`}
    >
      <div className="h-36 relative overflow-hidden">
        <Image
          src={categoryImage}
          alt={type.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-800 mb-2 leading-snug">
            {getEquipmentTypeName(type.name)}
          </h3>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            {getEquipmentTypeDesc(type.name) ||
              type.description ||
              t("defaultEquipmentDesc")}
          </p>
        </div>
        <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-50">
          <div className="flex items-center space-x-1">
            <span className="text-base font-medium text-primary">
              {type.equipmentCount || 0}
            </span>
            <span className="text-sm text-gray-400">{t("available")}</span>
          </div>
          <Button variant="card-primary" size="card">
            {t("viewEquipment")}
          </Button>
        </div>
      </div>
    </Link>
  )
}
