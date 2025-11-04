"use client"

import { useTranslations } from "next-intl"
import { User, LogIn } from "lucide-react"
import { Link } from "@/i18n/navigation"

export default function AuthButtons() {
  const t = useTranslations("common")

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/auth/login"
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
      >
        <LogIn size={16} />
        <span>{t("login")}</span>
      </Link>

      <Link
        href="/auth/register"
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
      >
        <User size={16} />
        <span>{t("signup")}</span>
      </Link>
    </div>
  )
}
