import { useTranslations } from "next-intl"
import { useFontClass } from "@/src/hooks/useFontClass"

export default function NotFoundState() {
  const t = useTranslations("equipmentDetails")
  const fontClass = useFontClass()

  return (
    <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${fontClass}`}>
      <div className="text-center">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("equipmentNotFound")}</h3>
        <p className="text-gray-600">{t("equipmentNotFoundDesc")}</p>
      </div>
    </div>
  )
}
