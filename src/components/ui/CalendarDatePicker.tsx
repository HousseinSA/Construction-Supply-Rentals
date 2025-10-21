'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useClickOutside } from '@/src/hooks/useClickOutside'

interface CalendarDatePickerProps {
  startDate: string
  endDate: string
  onDateChange: (startDate: string, endDate: string) => void
  placeholder?: string
}

export default function CalendarDatePicker({ startDate, endDate, onDateChange, placeholder }: CalendarDatePickerProps) {
  const t = useTranslations('landing')
  const locale = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedStart, setSelectedStart] = useState<Date | null>(startDate ? new Date(startDate) : null)
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(endDate ? new Date(endDate) : null)
  const [isSelectingEnd, setIsSelectingEnd] = useState(false)
  const dropdownRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false))

  const formatDateRange = () => {
    if (!selectedStart && !selectedEnd) return placeholder || t('datePicker.selectDates')
    if (selectedStart && !selectedEnd) return `${t('datePicker.from')} ${selectedStart.toLocaleDateString()}`
    if (!selectedStart && selectedEnd) return `${t('datePicker.until')} ${selectedEnd.toLocaleDateString()}`
    return `${t('datePicker.from')} ${selectedStart?.toLocaleDateString()} ${t('datePicker.to')} ${selectedEnd?.toLocaleDateString()}`
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const handleDateClick = (date: Date) => {
    if (!selectedStart || (selectedStart && selectedEnd)) {
      // Start new selection
      setSelectedStart(date)
      setSelectedEnd(null)
      setIsSelectingEnd(true)
    } else if (selectedStart && !selectedEnd) {
      // Select end date
      if (date >= selectedStart) {
        setSelectedEnd(date)
        setIsSelectingEnd(false)
      } else {
        setSelectedStart(date)
        setSelectedEnd(null)
      }
    }
  }

  const handleApply = () => {
    if (selectedStart && selectedEnd) {
      onDateChange(selectedStart.toISOString().split('T')[0], selectedEnd.toISOString().split('T')[0])
      setIsOpen(false)
    }
  }

  const handleClear = () => {
    setSelectedStart(null)
    setSelectedEnd(null)
    onDateChange('', '')
    setIsOpen(false)
  }

  const isDateInRange = (date: Date) => {
    if (!selectedStart || !selectedEnd) return false
    return date >= selectedStart && date <= selectedEnd
  }

  const isDateSelected = (date: Date) => {
    return (selectedStart && date.getTime() === selectedStart.getTime()) ||
           (selectedEnd && date.getTime() === selectedEnd.getTime())
  }

  const monthNames = {
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
    fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
  }
  
  const dayNames = {
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    ar: ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'],
    fr: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 text-left text-gray-900 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:outline-none focus:border-transparent cursor-pointer"
      >
        {formatDateRange()}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg z-50 p-4 min-w-80">
          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-2 hover:bg-gray-100 rounded text-gray-900"
            >
              ←
            </button>
            <h3 className="font-semibold text-gray-900">
              {monthNames[locale as keyof typeof monthNames][currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 hover:bg-gray-100 rounded text-gray-900"
            >
              →
            </button>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames[locale as keyof typeof dayNames].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {getDaysInMonth(currentMonth).map((date, index) => (
              <div key={index} className="aspect-square">
                {date && (
                  <button
                    onClick={() => handleDateClick(date)}
                    className={`w-full h-full rounded text-sm cursor-pointer ${
                      isDateSelected(date)
                        ? 'bg-primary text-white'
                        : isDateInRange(date)
                        ? 'bg-gray-100 text-primary'
                        : 'text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handleClear}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
            >
              {t('datePicker.clear')}
            </button>
            <button
              onClick={handleApply}
              disabled={!selectedStart || !selectedEnd}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {t('datePicker.apply')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}