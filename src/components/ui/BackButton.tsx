"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

interface BackButtonProps {
  className?: string
  showText?: boolean
  fallbackRoute?: string
}

export default function BackButton({ className = "", showText = true, fallbackRoute }: BackButtonProps) {
  const router = useRouter()
  const t = useTranslations("equipment")

  const handleBack = () => {
    if (fallbackRoute) {
      router.push(fallbackRoute)
    } else {
      router.back()
    }
  }

  return (
    <button 
      onClick={handleBack}
      className={`flex items-center space-x-2 rtl:space-x-reverse hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-200 group ${className}`}
    >
      <ArrowLeft size={20} className="group-hover:transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform" />
      {showText && (
        <span className="hidden sm:inline font-medium">
          {t("goBack")}
        </span>
      )}
    </button>
  )
}