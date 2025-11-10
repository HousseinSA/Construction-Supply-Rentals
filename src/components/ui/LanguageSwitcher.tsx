"use client"

import { useState } from "react"
import { useRouter, usePathname } from "@/i18n/navigation"
import { useLocale } from "next-intl"
import { useSearchParams } from "next/navigation"
import { ChevronDown } from "lucide-react"
import Image from "next/image"
import { useClickOutside } from "@/src/hooks/useClickOutside"

const languages = [
  { code: "fr", name: "Français" },
  { code: "en", name: "English" },
  { code: "ar", name: "العربية" },
]

interface LanguageSwitcherProps {
  onLanguageChange?: () => void
}

export default function LanguageSwitcher({ onLanguageChange }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const locale = useLocale()
  const dropdownRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false))

  const currentLanguage = languages.find((lang) => lang.code === locale)

  const handleLanguageChange = (langCode: string) => {
    document.cookie = `NEXT_LOCALE=${langCode}; path=/; max-age=${60 * 60 * 24}`
    // Preserve query parameters
    const queryString = searchParams.toString()
    const fullPath = queryString ? `${pathname}?${queryString}` : pathname
    router.replace(fullPath, { locale: langCode })
    router.refresh()
    setIsOpen(false)
    onLanguageChange?.()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors bg-white cursor-pointer"
      >
        <div className="w-5 h-5 relative">
          <Image
            src={`/flags/${locale}.png`}
            alt={currentLanguage?.name || ""}
            fill
            sizes="(max-width: 768px) 24px, 32px"
            className="object-cover rounded-sm"
          />
        </div>
        <span className="hidden sm:block text-sm font-medium">
          {currentLanguage?.name}
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-50 min-w-[140px] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors cursor-pointer ${
                locale === lang.code
                  ? "bg-gray-50 text-primary"
                  : "text-gray-700"
              }`}
            >
              <div className="w-5 h-5 relative">
                <Image
                  src={`/flags/${lang.code}.png`}
                  alt={lang.name}
                  fill
                  sizes="24px"
                  className="object-cover rounded-sm"
                />
              </div>
              <span className="font-medium">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
