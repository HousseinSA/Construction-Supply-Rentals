import { memo } from "react"
import { CheckCircle } from "lucide-react"
import Image from "next/image"
import { Equipment } from "@/src/lib/models"
import { useFontClass } from "@/src/hooks/useFontClass"
import { ColoredIcon } from "@/src/components/ui/EquipmentImage"

interface SuccessHeaderProps {
  t: (key: string) => string
  type: string
  mainLoading: boolean
  mainEquipment: Equipment | null
  equipmentName: string | null
}

function SuccessHeader({
  t,
  type,
  mainLoading,
  mainEquipment,
  equipmentName,
}: SuccessHeaderProps) {
  const fontClass = useFontClass()
  const isRTL = fontClass.includes("rtl")

  return (
    <div
      className={`bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:p-8 mb-6 ${fontClass}`}
    >
      <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8 max-w-5xl mx-auto">
        <div className="w-full lg:w-1/2 order-2 lg:order-1">
          <div className="relative w-full aspect-[4/3] sm:aspect-[3/2] rounded-lg overflow-hidden bg-gray-100 shadow-md">
            {mainLoading ? (
              <div className="w-full h-full bg-gray-200 animate-pulse" />
            ) : mainEquipment?.images?.[0] ? (
              <Image
                src={mainEquipment.images[0]}
                alt={mainEquipment.name || equipmentName || "Equipment"}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 500px"
                className="object-cover"
                priority
                loading="eager"
                quality={85}
              />
            ) : null}
          </div>
        </div>
        <div className="w-full lg:w-1/2 text-center lg:text-start order-1 lg:order-2">
          <div className="mb-4 sm:mb-5 flex justify-center lg:justify-start">
            <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-green-500" />
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-center lg:text-start text-gray-900 mb-3 sm:mb-4">
            {type === "sale" ? t("saleTitle") : t("title")}
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-5 sm:mb-6 text-center lg:text-start leading-relaxed">
            {type === "sale" ? t("saleMessage") : t("bookingMessage")}
          </p>
          {(mainEquipment || equipmentName) && (
            <div className="flex justify-center lg:justify-start">
              <div
                className={`inline-flex items-center ${isRTL ? "flex-row-reverse" : ""} gap-2.5 bg-amber-50 border border-amber-200 px-4 py-3 rounded-lg`}
              >
                <ColoredIcon alt="Equipment" size={24} color="amber" className="flex-shrink-0" />
                <span className="font-semibold text-amber-700 text-base sm:text-lg lg:text-xl break-words">
                  {mainEquipment?.name || equipmentName}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(SuccessHeader)
