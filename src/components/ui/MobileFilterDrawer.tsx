"use client"

import { X } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import Dropdown from "./Dropdown"
import { FilterConfig } from "./TableFilters"

interface MobileFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterConfig[]
  filterValues: Record<string, string>
  onFilterChange: (key: string, value: string) => void
}

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  filters,
  filterValues,
  onFilterChange,
}: MobileFilterDrawerProps) {
  const t = useTranslations("common")
  const [tempFilters, setTempFilters] = useState(filterValues)

  useEffect(() => {
    if (isOpen) {
      setTempFilters(filterValues)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen, filterValues])

  const handleApply = () => {
    Object.entries(tempFilters).forEach(([key, value]) => {
      onFilterChange(key, value)
    })
    onClose()
  }

  const handleClear = () => {
    const clearedFilters = Object.keys(tempFilters).reduce((acc, key) => ({ ...acc, [key]: "all" }), {})
    setTempFilters(clearedFilters)
  }

  const hasActiveFilters = Object.values(tempFilters).some(v => v !== "all")

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{t("filters")}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Filters */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filters.map((filter) => (
              <div key={filter.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {filter.label}
                </label>
                <Dropdown
                  options={filter.options}
                  value={tempFilters[filter.key] || "all"}
                  onChange={(value) => setTempFilters(prev => ({ ...prev, [filter.key]: value }))}
                  placeholder={filter.label}
                />
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <button
              onClick={handleApply}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              {t("applyFilters")}
            </button>
            {hasActiveFilters && (
              <button
                onClick={handleClear}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                {t("clearFilters")}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
