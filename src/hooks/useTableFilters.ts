import { useState, useMemo } from "react"

export interface UseTableFiltersConfig<T> {
  data: T[]
  searchFields: (keyof T)[]
  filterFunctions?: Record<string, (item: T, value: string) => boolean>
  defaultFilters?: Record<string, string>
}

export function useTableFilters<T>({
  data,
  searchFields,
  filterFunctions = {},
  defaultFilters = {},
}: UseTableFiltersConfig<T>) {
  const [searchValue, setSearchValue] = useState("")
  const [filterValues, setFilterValues] = useState<Record<string, string>>(defaultFilters)

  const filteredData = useMemo(() => {
    let result = [...data]

    // Apply search filter
    if (searchValue.trim()) {
      const searchLower = searchValue.toLowerCase()
      result = result.filter((item) =>
        searchFields.some((field) => {
          // Handle nested fields (e.g., "renterInfo.firstName")
          const fieldPath = String(field).split('.')
          let value: any = item
          
          for (const key of fieldPath) {
            if (value == null) return false
            value = value[key]
          }
          
          // Handle arrays (e.g., supplierInfo array)
          if (Array.isArray(value)) {
            return value.some(v => String(v).toLowerCase().includes(searchLower))
          }
          
          if (value == null) return false
          return String(value).toLowerCase().includes(searchLower)
        })
      )
    }

    // Apply custom filters
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
