"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"

interface YearPickerProps {
  value: string
  onChange: (year: string) => void
  label: string
  placeholder?: string
  disabled?: boolean
}

export default function YearPicker({
  value,
  onChange,
  label,
  placeholder = "Select year",
  disabled = false,
}: YearPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [displayYear, setDisplayYear] = useState(new Date().getFullYear())
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentYear = new Date().getFullYear()
  const minYear = 1970
  const startYear = Math.floor(displayYear / 12) * 12
  const endYear = Math.min(startYear + 11, currentYear)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleYearSelect = (year: number) => {
    onChange(year.toString())
    setIsOpen(false)
  }

  const goToPreviousDecade = () => {
    const newYear = displayYear - 12
    if (newYear >= minYear) {
      setDisplayYear(newYear)
    }
  }

  const goToNextDecade = () => {
    const newYear = displayYear + 12
    if (newYear <= currentYear) {
      setDisplayYear(newYear)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-left focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-between"
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={goToPreviousDecade}
              disabled={startYear <= minYear}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="font-semibold text-gray-900">
              {startYear} - {endYear}
            </span>
            <button
              type="button"
              onClick={goToNextDecade}
              disabled={startYear + 12 > currentYear}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 12 }, (_, i) => startYear + i)
              .filter((year) => year >= minYear && year <= currentYear)
              .map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => handleYearSelect(year)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    value === year.toString()
                      ? "bg-primary text-white"
                      : year === currentYear
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {year}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
