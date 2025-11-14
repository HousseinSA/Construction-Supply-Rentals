import { useTranslations } from "next-intl"
import { useFontClass } from "@/src/hooks/useFontClass"

export default function LoadingState() {
  const t = useTranslations("equipmentDetails")
  const fontClass = useFontClass()

  return (
    <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${fontClass}`}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">{t("loading")}</p>
      </div>
    </div>
  )
}
