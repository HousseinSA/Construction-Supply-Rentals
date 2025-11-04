"use client"

import { useState } from "react"
import { useRouter, usePathname } from "@/i18n/navigation"
import { useLocale } from "next-intl"
import { ChevronDown } from "lucide-react"
import Image from "next/image"
import { useClickOutside } from "@/src/hooks/useClickOutside"

const languages = [
  { code: "fr", name: "Français" },
  { code: "en", name: "English" },
  { code: "ar", name: "العربية" },
]

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const dropdownRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false))

  const currentLanguage = languages.find((lang) => lang.code === locale)

  const handleLanguageChange = (langCode: string) => {
    // Strip the current locale from pathname
    const pathWithoutLocale = pathname.replace(/^\/(fr|en|ar)/, "")

    // Replace route with new locale
    router.replace(pathWithoutLocale || "/", { locale: langCode })
    setIsOpen(false)
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
        <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg cursor-pointer ${
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
