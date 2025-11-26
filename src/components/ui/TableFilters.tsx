"use client"

import { Search } from "lucide-react"
import Dropdown from "./Dropdown"

export interface FilterConfig {
  key: string
  label: string
  options: { value: string; label: string }[]
  type?: "select" | "dateRange"
}

interface TableFiltersProps {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filters: FilterConfig[]
  filterValues: Record<string, string>
  onFilterChange: (key: string, value: string) => void
}

export default function TableFilters({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters,
  filterValues,
  onFilterChange,
}: TableFiltersProps) {

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-2 pl-9 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all duration-200"
          />
        </div>

        {/* Filters */}
        {filters.map((filter) => (
          <div key={filter.key} className="sm:w-[180px]">
            <Dropdown
              options={filter.options}
              value={filterValues[filter.key] || "all"}
              onChange={(value) => onFilterChange(filter.key, value)}
              placeholder={filter.label}
              compact
            />
          </div>
        ))}
      </div>
    </div>
  )
}
