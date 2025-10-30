"use client"

import { useCategories } from "@/src/hooks/useCategories"
import { useCategoryMapping } from "@/src/hooks/useCategoryMapping"
import { useTranslations, useLocale } from "next-intl"
import Image from "next/image"
import { Link } from "@/src/i18n/navigation"
import CategoriesLoading from "./CategoriesLoading"
import CategoriesEmpty from "./CategoriesEmpty"

export default function EquipmentCategories() {
  const t = useTranslations("landing")
  const locale = useLocale()
  const { categories, loading, error, refetch } = useCategories()
  const { getCategoryInfo, getCategoryKey } = useCategoryMapping()
  
  const getFontClass = () => {
    switch (locale) {
      case 'ar': return 'font-arabic'
      case 'fr': return 'font-french'
      default: return 'font-english'
    }
  }

  if (loading) return <CategoriesLoading count={categories?.length || 4} />
  if (error) return <CategoriesEmpty onRetry={refetch} />

  return (
    <section id="equipment" className={`py-8 sm:py-12 md:py-16 bg-gray-50 ${getFontClass()}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-10 md:mb-12 text-gray-900">
          {t("categories.title")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {categories.map((category) => {
            const categoryKey = getCategoryKey(category.name)
            const { image, translationKey } = getCategoryInfo(categoryKey)

            return (
              <Link
                key={category._id}
                href={`/categories/${categoryKey}`}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100 hover:border-primary overflow-hidden transform hover:scale-105 block"
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
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}