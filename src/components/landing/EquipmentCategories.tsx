"use client"

import { useCategories } from "@/src/hooks/useCategories"
import { useTranslations } from "next-intl"

const categoryMapping: {
  [key: string]: { icon: string; translationKey: string }
} = {
  "engins-spcialiss": { icon: "⚙️", translationKey: "enginsspecialises" },
  "engins-lgers-et-auxiliaires": {
    icon: "🛠️",
    translationKey: "enginslegerseteauxiliaires",
  },
  terrassement: { icon: "🚜", translationKey: "terrassement" },
  "nivellement-et-compactage": {
    icon: "📏",
    translationKey: "nivellementcompactage",
  },
  transport: { icon: "🚛", translationKey: "transport" },
  "levage-et-manutention": { icon: "🏗️", translationKey: "levageemanutention" },
}

export default function EquipmentCategories() {
  const t = useTranslations("landing")
  const { categories, loading, error, refetch } = useCategories()

  if (loading) {
    return (
      <section id="equipment" className="py-8 sm:py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-10 md:mb-12 text-gray-900">
            {t("categories.title")}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 text-center"
              >
                <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-2 sm:mb-3 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-20 mx-auto mb-1 animate-pulse" />
                <div className="h-3 bg-gray-100 rounded w-16 mx-auto mb-2 animate-pulse" />
                <div className="h-5 bg-gray-100 rounded-full w-14 mx-auto animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="equipment" className="py-8 sm:py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-10 md:mb-12 text-gray-900">
            {t("categories.title")}
          </h2>

          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg border border-red-100 p-6 sm:p-8 text-center">
            <div className="text-5xl sm:text-6xl mb-4 text-red-500">⚠️</div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              {t("categories.errorTitle")}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
              {t("categories.errorMessage")}
            </p>
            <button
              onClick={() => refetch()}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition-colors font-semibold cursor-pointer"
            >
              {t("categories.retryButton")}
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="equipment" className="py-8 sm:py-12 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-10 md:mb-12 text-gray-900">
          {t("categories.title")}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((category) => {
            const categoryKey = category.name
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z-]/g, "")

            const mapping = categoryMapping[categoryKey]
            const icon = mapping?.icon || "🏗️"
            const translationKey = mapping?.translationKey || categoryKey

            return (
              <div
                key={category._id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100 hover:border-primary p-4 sm:p-6 text-center transform hover:scale-105"
              >
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{icon}</div>
                <h3 className="font-bold text-xs sm:text-sm text-gray-900 mb-1 group-hover:text-primary transition-colors leading-tight">
                  {t(`categories.${translationKey}`)}
                </h3>
                <p className="text-xs text-gray-500 mb-2 leading-tight">
                  {t(`categories.${translationKey}Desc`)}
                </p>
                <p className="text-xs text-primary font-semibold bg-gray-50 px-2 py-1 rounded-full inline-block">
                  {category.equipmentTypeCount} {t("categories.type")}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
