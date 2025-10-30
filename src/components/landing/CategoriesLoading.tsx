import { useTranslations } from "next-intl"

interface CategoriesLoadingProps {
  count?: number
}

export default function CategoriesLoading({ count = 4 }: CategoriesLoadingProps) {
  const t = useTranslations("landing")

  return (
    <section id="equipment" className="py-8 sm:py-12 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-10 md:mb-12 text-gray-900">
          {t("categories.title")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="w-full h-32 bg-gray-200 animate-pulse" />
              <div className="p-6 text-center">
                <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="h-3 bg-gray-100 rounded mb-3 animate-pulse" />
                <div className="h-6 bg-gray-200 rounded-full w-20 mx-auto animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}