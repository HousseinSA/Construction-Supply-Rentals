import { useTranslations } from "next-intl"
import BackButton from "@/components/ui/BackButton"

interface CategoryHeaderProps {
  categoryInfo: {
    image: string
    translationKey: string
  }
}

export default function CategoryHeader({ categoryInfo }: CategoryHeaderProps) {
  const t = useTranslations("categories")

  return (
    <div className="relative h-32 bg-gradient-to-r from-primary to-primary-dark">
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 h-full flex items-center justify-between px-4 sm:px-6 lg:px-8 text-white max-w-7xl mx-auto">
        <BackButton className="text-white" fallbackRoute="/" />
        
        <div className="text-center flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold">
            {t(categoryInfo.translationKey as string)}
          </h1>
          <p className="text-sm sm:text-base opacity-90 mt-1">
            {t(`${categoryInfo.translationKey}Desc` as string)}
          </p>
        </div>
        
        <div className="w-16"></div>
      </div>
    </div>
  )
}
