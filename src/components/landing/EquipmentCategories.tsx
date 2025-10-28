"use client"

import { useCategories } from "@/src/hooks/useCategories"
import { useTranslations } from "next-intl"
import Image from "next/image"

const categoryMapping: {
  [key: string]: { image: string; translationKey: string }
} = {
  terrassement: {
    image: "/equipement-images/Pelle hydraulique.jpg",
    translationKey: "terrassement",
  },
  "nivellement-et-compactage": {
    image: "/equipement-images/Niveuleuse.jpg",
    translationKey: "nivellementcompactage",
  },
  transport: {
    image: "/equipement-images/Camion-benne.jpg",
    translationKey: "transport",
  },
  "levage-et-manutention": {
    image: "/equipement-images/Grue mobile.jpg",
    translationKey: "levageemanutention",
  },
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {Array.from({ length: categories?.length || 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
              >
                <div className="w-full h-32 bg-gray-200 animate-pulse" />
                <div className="p-6 text-center">
                  <div className="h-5 bg-gray-200 rounded w-24 mx-auto mb-3 animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded w-32 mx-auto mb-3 animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded-full w-16 mx-auto animate-pulse" />
                </div>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {categories.map((category) => {
            const categoryKey = category.name
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z-]/g, "")

            const mapping = categoryMapping[categoryKey]
            const image = mapping?.image || ""
            const translationKey = mapping?.translationKey || categoryKey

            return (
              <div
                key={category._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100 hover:border-primary overflow-hidden transform hover:scale-105"
              >
                <div className="w-full h-32 relative overflow-hidden">
                  {image ? (
                    <Image
                      src={image}
                      alt={t(`categories.${translationKey}`)}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 animate-pulse" />
                  )}
                </div>
                <div className="p-6 text-center">
                  <h3 className="font-bold text-base text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {t(`categories.${translationKey}`)}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {t(`categories.${translationKey}Desc`)}
                  </p>
                  <p className="text-sm text-primary font-semibold bg-primary/10 px-4 py-2 rounded-full inline-block">
                    {category.equipmentTypeCount} {t("categories.type")}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
