import { useState, useMemo, useEffect } from "react"

export interface UseTableFiltersConfig<T> {
  data: T[]
  searchFields: (keyof T)[]
  customSearchFilter?: (item: T, search: string) => boolean
  filterFunctions?: Record<string, (item: T, value: string) => boolean>
  defaultFilters?: Record<string, string>
  persistKey?: string
}

export function useTableFilters<T>({
  data,
  searchFields,
  customSearchFilter,
  filterFunctions = {},
  defaultFilters = {},
  persistKey,
}: UseTableFiltersConfig<T>) {
  const [searchValue, setSearchValue] = useState("")
  const [filterValues, setFilterValues] = useState<Record<string, string>>(() => {
    if (persistKey && typeof window !== "undefined") {
      const saved = localStorage.getItem(`filters_${persistKey}`)
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          return defaultFilters
        }
      }
    }
    return defaultFilters
  })

  useEffect(() => {
    if (persistKey && typeof window !== "undefined") {
      localStorage.setItem(`filters_${persistKey}`, JSON.stringify(filterValues))
    }
  }, [filterValues, persistKey])

  const filteredData = useMemo(() => {
    let result = [...data]

    if (searchValue.trim()) {
      const searchLower = searchValue.toLowerCase()
      
      if (customSearchFilter) {
        result = result.filter((item) => customSearchFilter(item, searchValue))
      } else {
        result = result.filter((item) =>
          searchFields.some((field) => {
            const fieldPath = String(field).split('.')
            let value: any = item
            
            for (const key of fieldPath) {
              if (value == null) return false
              value = value[key]
            }
            
            if (Array.isArray(value)) {
              return value.some(v => String(v).toLowerCase().includes(searchLower))
            }
            
            if (value == null) return false
            return String(value).toLowerCase().includes(searchLower)
          })
        )
      }
    }

    Object.entries(filterValues).forEach(([key, value]) => {
      if (value && value !== "all" && filterFunctions[key]) {
        result = result.filter((item) => filterFunctions[key](item, value))
      }
    })

    return result
  }, [data, searchValue, filterValues, searchFields, filterFunctions])

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setSearchValue("")
    setFilterValues(defaultFilters)
  }

  return {
    searchValue,
    setSearchValue,
    filterValues,
    handleFilterChange,
    clearFilters,
    filteredData,
  }
}
