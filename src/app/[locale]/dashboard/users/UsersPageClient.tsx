"use client"

import { ArrowLeft } from "lucide-react"
import { Link } from "@/src/i18n/navigation"
import { useTranslations } from "next-intl"
import HomeButton from "@/src/components/ui/HomeButton"
import UsersManagement from "@/src/components/dashboard/users/UsersManagement"

export default function UsersPageClient() {
  const t = useTranslations("dashboard.pages.users")
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Link
                href="/dashboard"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {t("title")}
                </h1>
                <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                  {t("subtitle")}
                </p>
              </div>
            </div>
            <HomeButton />
          </div>
        </div>
        
        <UsersManagement />
      </div>
    </div>
  )
}