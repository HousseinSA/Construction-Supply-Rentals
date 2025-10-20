'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import CalendarDatePicker from '@/components/ui/CalendarDatePicker'
import CitySelector from '@/components/ui/CitySelector'

export default function HeroSection() {
  const t = useTranslations('landing')
  const [location, setLocation] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleSearch = () => {
    console.log('Search:', { location, startDate, endDate })
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
        <div className="bg-white rounded-xl p-2 sm:p-3 flex flex-col md:flex-row gap-2 sm:gap-3 max-w-4xl mx-auto shadow-2xl">
          <CitySelector
            selectedCity={location}
            onCityChange={setLocation}
            placeholder={t('hero.searchPlaceholder')}
          />
          
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