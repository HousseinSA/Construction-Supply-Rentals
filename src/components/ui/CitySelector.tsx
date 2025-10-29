"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useClickOutside } from "@/src/hooks/useClickOutside"

const mauritaniaCities = {
  en: [
    "Nouakchott",
    "Nouadhibou",
    "Rosso",
    "Kaédi",
    "Zouérat",
    "Kiffa",
    "Atar",
    "Sélibaby",
    "Akjoujt",
    "Tidjikja",
  ],
  ar: [
    "نواكشوط",
    "نواذيبو",
    "روصو",
    "كيهيدي",
    "الزويرات",
    "كيفة",
    "أطار",
    "سيليبابي",
    "أكجوجت",
    "تيجيكجة",
  ],
  fr: [
    "Nouakchott",
    "Nouadhibou",
    "Rosso",
    "Kaédi",
    "Zouérat",
    "Kiffa",
    "Atar",
    "Sélibaby",
    "Akjoujt",
    "Tidjikja",
  ],
}

// Map display names to Latin names for API calls
const cityToLatinMap: { [key: string]: string } = {
  "نواكشوط": "Nouakchott",
  "نواذيبو": "Nouadhibou", 
  "روصو": "Rosso",
  "كيهيدي": "Kaédi",
  "الزويرات": "Zouérat",
  "كيفة": "Kiffa",
  "أطار": "Atar",
  "سيليبابي": "Sélibaby",
  "أكجوجت": "Akjoujt",
  "تيجيكجة": "Tidjikja"
}

interface CitySelectorProps {
  selectedCity: string
  onCityChange: (city: string) => void
  placeholder?: string
}

export default function CitySelector({
  selectedCity,
  onCityChange,
  placeholder,
}: CitySelectorProps) {
  const t = useTranslations("landing")
  const locale = useLocale() as "en" | "ar" | "fr"
  const [showCities, setShowCities] = useState(false)
  const cityDropdownRef = useClickOutside<HTMLDivElement>(() =>
    setShowCities(false)
  )

  // Get default city in current language
  const getDefaultCity = () => {
    return mauritaniaCities[locale][0] // First city is always Nouakchott
  }

  // Display selected city or default
  const displayValue = selectedCity || getDefaultCity()

  const selectCity = (city: string) => {
    // Convert to Latin name for API consistency
    const latinCity = cityToLatinMap[city] || city
    onCityChange(latinCity)
    setShowCities(false)
  }

  return (
    <div className="flex-1 relative" ref={cityDropdownRef}>
      <button
        type="button"
        onClick={() => setShowCities(true)}
        className={`w-full px-4 py-3 text-gray-900 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:outline-none focus:border-transparent cursor-pointer flex items-center justify-between ${
          locale === 'ar' ? 'text-right' : 'text-left'
        }`}
      >
        <span>{displayValue}</span>
        <svg 
          className={`w-5 h-5 text-gray-400 transition-transform ${
            showCities ? 'rotate-180' : ''
          }`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {showCities && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg z-[9999] max-h-48 overflow-y-auto">
          {mauritaniaCities[locale].map((city) => (
              <button
                key={city}
                onClick={() => selectCity(city)}
                className={`w-full px-4 py-2 hover:bg-gray-100 text-gray-900 first:rounded-t-lg last:rounded-b-lg cursor-pointer ${
                  locale === 'ar' ? 'text-right' : 'text-left'
                } ${
                  displayValue === city
                    ? "bg-gray-100 text-primary font-semibold"
                    : ""
                }`}
              >
                {city}
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
