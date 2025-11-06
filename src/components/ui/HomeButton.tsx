"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/src/i18n/navigation"
import { Home } from "lucide-react"

interface HomeButtonProps {
  showText?: boolean
  className?: string
}

export default function HomeButton({ showText = true, className = "" }: HomeButtonProps) {
  const t = useTranslations("dashboard")

  return (
    <Link
      href="/"
      className={`flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-md ${className}`}
    >
      <Home className="h-5 w-5" />
      {showText && <span className="hidden sm:inline">{t("goToHome")}</span>}
    </Link>
  )
}
