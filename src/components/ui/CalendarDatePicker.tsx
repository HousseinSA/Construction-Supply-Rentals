'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useClickOutside } from '@/src/hooks/useClickOutside'

interface CalendarDatePickerProps {
  value?: string
  onChange?: (date: string) => void
  startDate?: string
  endDate?: string
  onDateChange?: (startDate: string, endDate: string) => void
  placeholder?: string
  label?: string
  required?: boolean
  minDate?: string
  singleDate?: boolean
}

export default function CalendarDatePicker({ 
  value, 
  onChange, 
  startDate, 
  endDate, 
  onDateChange, 
  placeholder,
  label,
  required,
  minDate,
  singleDate = false
}: CalendarDatePickerProps) {
  const t = useTranslations('booking')
  const locale = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedStart, setSelectedStart] = useState<Date | null>(
    singleDate && value ? new Date(value) : startDate ? new Date(startDate) : null
  )
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(endDate ? new Date(endDate) : null)
  const dropdownRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false))

  const formatDateRange = () => {
    if (singleDate) {
      if (!selectedStart) return placeholder || t('selectDate')
      return selectedStart.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })
    }
    if (!selectedStart && !selectedEnd) return placeholder || t('selectDate')
    if (selectedStart && !selectedEnd) return `${selectedStart.toLocaleDateString()}`
    if (!selectedStart && selectedEnd) return `${selectedEnd.toLocaleDateString()}`
    return `${selectedStart?.toLocaleDateString()} - ${selectedEnd?.toLocaleDateString()}`
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const handleDateClick = (date: Date) => {
    const min = minDate ? new Date(minDate) : null
    if (min) {
      min.setHours(0, 0, 0, 0)
      const checkDate = new Date(date)
      checkDate.setHours(0, 0, 0, 0)
      if (checkDate < min) return
    }

    if (singleDate) {
      setSelectedStart(date)
      onChange?.(date.toISOString().split('T')[0])
      setIsOpen(false)
    } else {
      if (!selectedStart || (selectedStart && selectedEnd)) {
        setSelectedStart(date)
        setSelectedEnd(null)
      } else if (selectedStart && !selectedEnd) {
        if (date >= selectedStart) {
          setSelectedEnd(date)
        } else {
          setSelectedStart(date)
          setSelectedEnd(null)
        }
      }
    }
  }

  const handleApply = () => {
    if (selectedStart && selectedEnd && onDateChange) {
      onDateChange(selectedStart.toISOString().split('T')[0], selectedEnd.toISOString().split('T')[0])
      setIsOpen(false)
    }
  }

  const handleClear = () => {
    setSelectedStart(null)
    setSelectedEnd(null)
    if (singleDate) {
      onChange?.('')
    } else {
      onDateChange?.('', '')
    }
  }

  const isDateDisabled = (date: Date) => {
    if (!minDate) return false
    const min = new Date(minDate)
    min.setHours(0, 0, 0, 0)
    const checkDate = new Date(date)
    checkDate.setHours(0, 0, 0, 0)
    return checkDate < min
  }

  const isDateInRange = (date: Date) => {
    if (!selectedStart || !selectedEnd) return false
    return date >= selectedStart && date <= selectedEnd
  }

  const isDateSelected = (date: Date) => {
    return (selectedStart && date.toDateString() === selectedStart.toDateString()) ||
           (selectedEnd && date.toDateString() === selectedEnd.toDateString())
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
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 text-left bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none focus:border-primary transition-all duration-200"
        >
          <span className={selectedStart ? 'text-gray-900' : 'text-gray-500'}>
            {formatDateRange()}
          </span>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg z-50 p-4 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <button
                type="button"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 rounded text-gray-900"
              >
                ←
              </button>
              <h3 className="font-semibold text-gray-900">
                {monthNames[locale as keyof typeof monthNames][currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button
                type="button"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 rounded text-gray-900"
              >
                →
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames[locale as keyof typeof dayNames].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 p-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentMonth).map((date, index) => (
                <div key={index}>
                  {date ? (
                    <button
                      type="button"
                      onClick={() => handleDateClick(date)}
                      disabled={isDateDisabled(date)}
                      className={`w-full h-9 rounded text-sm ${
                        isDateSelected(date)
                          ? 'bg-primary text-white font-semibold'
                          : isDateInRange(date)
                          ? 'bg-primary/10 text-primary'
                          : isDateDisabled(date)
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-900 hover:bg-gray-100 cursor-pointer'
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  ) : (
                    <div className="w-full h-9" />
                  )}
                </div>
              ))}
            </div>

            {!singleDate && (
              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={!selectedStart || !selectedEnd}
                  className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
