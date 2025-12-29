'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useClickOutside } from '@/src/hooks/useClickOutside'
import { Calendar } from 'lucide-react'

interface DatePickerProps {
  startDate?: string
  endDate?: string
  onDateChange: (startDate: string, endDate: string) => void
  label: string
  required?: boolean
  showRange?: boolean
}

export default function DatePicker({ startDate, endDate, onDateChange, label, required, showRange = true }: DatePickerProps) {
  const t = useTranslations('booking')
  const locale = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const [month, setMonth] = useState(new Date())
  const [start, setStart] = useState<Date | null>(startDate ? new Date(startDate) : null)
  const [end, setEnd] = useState<Date | null>(endDate ? new Date(endDate) : null)
  const ref = useClickOutside<HTMLDivElement>(() => {
    if (showRange && start && !end) {
      return 
    }
    setIsOpen(false)
  })

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

  const getDays = () => {
    const year = month.getFullYear()
    const m = month.getMonth()
    const firstDay = new Date(year, m, 1).getDay()
    const daysInMonth = new Date(year, m + 1, 0).getDate()
    const days = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, m, d))
    return days
  }

  const handleClick = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date < today) return

    if (!showRange) {
      setStart(date)
      onDateChange(date.toISOString().split('T')[0], '')
      setIsOpen(false)
      return
    }

    if (!start || (start && end)) {
      setStart(date)
      setEnd(null)
    } else {
      if (date >= start) {
        setEnd(date)
      } else {
        setStart(date)
        setEnd(null)
      }
    }
  }

  const isSelected = (date: Date) => {
    return (start && date.toDateString() === start.toDateString()) || (end && date.toDateString() === end.toDateString())
  }

  const isInRange = (date: Date) => {
    return start && end && date > start && date < end
  }

  const isPast = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const format = () => {
    if (!start) return t('selectDate')
    const formatShort = (d: Date) => {
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()
      return `${day}/${month}/${year}`
    }
    if (!showRange || !end) return formatShort(start)
    return `${t('from')}: ${formatShort(start)} ${t('to')}: ${formatShort(end)}`
  }

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 text-left bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none focus:border-primary transition-all duration-200 flex items-center justify-between"
      >
        <span className={start ? 'text-gray-900' : 'text-gray-500'}>{format()}</span>
        <Calendar className="w-5 h-5 text-gray-400" />
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl p-4 w-80">
          <div className="flex justify-between items-center mb-1">
            <button 
              type="button" 
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1))} 
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="text-gray-700 font-semibold">←</span>
            </button>
            <h3 className="font-semibold text-sm text-gray-900">
              {monthNames[locale as keyof typeof monthNames][month.getMonth()]} {month.getFullYear()}
            </h3>
            <button 
              type="button" 
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1))} 
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="text-gray-700 font-semibold">→</span>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1.5 mb-2">
            {dayNames[locale as keyof typeof dayNames].map((d, i) => (
              <div key={i} className="text-center text-sm font-semibold text-gray-600 py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5 mb-1">
            {getDays().map((date, i) => (
              <div key={i}>
                {date ? (
                  <button
                    type="button"
                    onClick={() => handleClick(date)}
                    disabled={isPast(date)}
                    className={`w-full h-8 text-sm rounded-lg font-medium transition-all ${
                      isSelected(date) 
                        ? 'bg-primary text-white shadow-md' 
                        : isInRange(date) 
                        ? 'bg-primary/10 text-primary' 
                        : isPast(date) 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                ) : (
                  <div className="w-full h-8" />
                )}
              </div>
            ))}
          </div>

          {showRange && (
            <div className="flex justify-end pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  if (start && end) {
                    onDateChange(start.toISOString().split('T')[0], end.toISOString().split('T')[0])
                    setIsOpen(false)
                  }
                }}
                disabled={!start || !end}
                className="px-4 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {t('apply')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
