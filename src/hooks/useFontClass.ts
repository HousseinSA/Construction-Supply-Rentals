import { useLocale } from "next-intl"

export function useFontClass() {
  const locale = useLocale()
  
  const getFontClass = () => {
    switch (locale) {
      case 'ar': return 'font-arabic'
      case 'fr': return 'font-french'
      default: return 'font-english'
    }
  }
  
  return getFontClass()
}