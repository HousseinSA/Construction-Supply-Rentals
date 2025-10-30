"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useClickOutside } from "@/src/hooks/useClickOutside"
import { useCityData } from "@/src/hooks/useCityData"

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
  const [showCities, setShowCities] = useState(false)
  const { cities, convertToLatin, getDisplayValue, locale } = useCityData()
  
  const cityDropdownRef = useClickOutside<HTMLDivElement>(() =>
    setShowCities(false)
  )

  const displayValue = getDisplayValue(selectedCity)

  const selectCity = (city: string) => {
    const latinCity = convertToLatin(city)
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
          {cities.map((city) => (
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