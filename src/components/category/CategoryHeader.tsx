import { useTranslations } from "next-intl"
import PageBanner from "@/components/ui/PageBanner"

interface CategoryHeaderProps {
  categoryInfo: {
    image: string
    translationKey: string
  }
}

export default function CategoryHeader({ categoryInfo }: CategoryHeaderProps) {
  const t = useTranslations("categories")

  return (
    <PageBanner 
      title={t(categoryInfo.translationKey as string)}
    />
  )
}
