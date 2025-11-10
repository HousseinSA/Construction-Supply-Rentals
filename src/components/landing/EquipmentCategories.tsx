"use client"

import { useCategories } from "@/src/hooks/useCategories"
import { useCategoryMapping } from "@/src/hooks/useCategoryMapping"
import { useFontClass } from "@/src/hooks/useFontClass"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { Link } from "@/src/i18n/navigation"
import CategoriesLoading from "./CategoriesLoading"
import CategoriesEmpty from "./CategoriesEmpty"

export default function EquipmentCategories() {
  const t = useTranslations("landing")
  const fontClass = useFontClass()
  const { categories, loading, error } = useCategories()
  const { getCategoryInfo, getCategoryKey } = useCategoryMapping()

  if (loading) return <CategoriesLoading count={categories?.length || 4} />
  if (error) return <CategoriesEmpty />

  return (
    <section
      id="equipment"
      className={`py-8 sm:py-12 md:py-16 bg-gray-50 ${fontClass}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-10 md:mb-12 text-gray-900">
          {t("categories.title")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {categories.map((category) => {
            const categorySlug = getCategoryKey(category.name)
            const { image, translationKey } = getCategoryInfo(categorySlug)
            return (
              <Link
                key={category._id}
                href={`/categories/${categorySlug}`}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100 hover:border-primary overflow-hidden transform hover:scale-105 flex flex-col"
              >
                <div className="w-full h-40 relative overflow-hidden">
                  {image ? (
                    <Image
                      src={image}
                      alt={t(`categories.${translationKey}`)}
                      fill
                      className="object-cover ken-burns-effect"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 animate-pulse" />
                  )}
                </div>
                <div className="p-4 text-center flex flex-col flex-1">
                  <h3 className="font-bold text-base text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {t(`categories.${translationKey}`)}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 flex-1">
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
