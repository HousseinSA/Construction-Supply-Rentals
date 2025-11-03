import { useTranslations } from "next-intl"

export default function CategoriesEmpty() {
  const t = useTranslations("landing")

  return (
    <section id="equipment" className="py-8 sm:py-12 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-10 md:mb-12 text-gray-900">
          {t("categories.title")}
        </h2>
        <div className="text-center py-12">
          <p className="text-gray-600">{t("categories.errorMessage")}</p>
        </div>
      </div>
    </section>
  )
}