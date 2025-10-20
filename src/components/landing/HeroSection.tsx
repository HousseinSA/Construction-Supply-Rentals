'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import CalendarDatePicker from '@/components/ui/CalendarDatePicker'
import { useLocale } from 'next-intl'
import { useClickOutside } from '@/src/hooks/useClickOutside'

const mauritaniaCities = {
  en: ['Nouakchott', 'Nouadhibou', 'Rosso', 'Kaédi', 'Zouérat', 'Kiffa', 'Atar', 'Sélibaby', 'Akjoujt', 'Tidjikja'],
  ar: ['نواكشوط', 'نواذيبو', 'روصو', 'كيهيدي', 'الزويرات', 'كيفة', 'أطار', 'سيليبابي', 'أكجوجت', 'تيجيكجة'],
  fr: ['Nouakchott', 'Nouadhibou', 'Rosso', 'Kaédi', 'Zouérat', 'Kiffa', 'Atar', 'Sélibaby', 'Akjoujt', 'Tidjikja']
}

export default function HeroSection() {
  const t = useTranslations('landing')
  const [location, setLocation] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showCities, setShowCities] = useState(false)
  const [isLocationSelected, setIsLocationSelected] = useState(false)
  const locale = useLocale() as 'en' | 'ar' | 'fr'
  const cityDropdownRef = useClickOutside<HTMLDivElement>(() => setShowCities(false))

  const handleSearch = () => {
    console.log('Search:', { location, startDate, endDate })
  }

  const selectCity = (city: string) => {
    setLocation(city)
    setShowCities(false)
    setIsLocationSelected(true)
  }

  const handleDateChange = (start: string, end: string) => {
    setStartDate(start)
    setEndDate(end)
  }

  return (
    <section className="relative h-[50vh] md:h-[70vh] flex items-center justify-center">
      {/* Background Image - Mauritanian construction */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')"
        }}
      />
      
      {/* Dark overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 leading-tight drop-shadow-2xl">
          {t('hero.title')}
        </h1>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 md:mb-8 text-gray-100 drop-shadow-lg px-2">
          {t('hero.subtitle')}
        </p>
        
        {/* Search Bar */}
        <div className="bg-white rounded-xl p-2 sm:p-3 flex flex-col md:flex-row gap-2 sm:gap-3 max-w-4xl mx-auto shadow-2xl">
          {/* Location Dropdown */}
          <div className="flex-1 relative" ref={cityDropdownRef}>
            <input
              type="text"
              placeholder={t('hero.searchPlaceholder')}
              value={location}
              onChange={(e) => {
                setLocation(e.target.value)
                setIsLocationSelected(false)
              }}
              onFocus={() => setShowCities(true)}
              onClick={() => {
                setShowCities(true)
                if (isLocationSelected) {
                  // Keep the selected city but show all cities in dropdown
                  setShowCities(true)
                }
              }}
              className="w-full px-4 py-3 text-gray-900 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:outline-none focus:border-transparent cursor-pointer"
            />
            {showCities && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg z-50 max-h-48 overflow-y-auto">
                {mauritaniaCities[locale as keyof typeof mauritaniaCities]
                  .filter(city => {
                    if (isLocationSelected) {
                      // Show all cities when a city is already selected
                      return true
                    }
                    // Show filtered cities when typing
                    return city.toLowerCase().includes(location.toLowerCase())
                  })
                  .map((city) => (
                    <button
                      key={city}
                      onClick={() => selectCity(city)}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-900 first:rounded-t-lg last:rounded-b-lg cursor-pointer ${
                        location === city ? 'bg-orange-100 text-orange-700 font-semibold' : ''
                      }`}
                    >
                      {city}
                    </button>
                  ))
                }
              </div>
            )}
          </div>
          
          {/* Date Range Picker */}
          <div className="flex-1">
            <CalendarDatePicker
              startDate={startDate}
              endDate={endDate}
              onDateChange={handleDateChange}
              placeholder={t('hero.datesPlaceholder')}
            />
          </div>
          
          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg transition-colors font-semibold whitespace-nowrap cursor-pointer"
          >
            {t('hero.searchButton')}
          </button>
        </div>
      </div>
    </section>
  )
}