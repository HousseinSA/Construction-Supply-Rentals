import { useCallback } from "react"

interface FilterValues {
  status: string
  listingType: string
  availability: string
  location: string
  [key: string]: string
}

export function useManageEquipmentHandlers(
  setFilterValues: (fn: (prev: FilterValues) => FilterValues) => void,
  setSearchValue: (value: string) => void,
  setCurrentPage: (page: number) => void,
  invalidateCache: (selective?: boolean) => void,
) {
  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      setFilterValues((prev) => ({ ...prev, [key]: value }))
      setCurrentPage(1)
      invalidateCache(true)
    },
    [setFilterValues, setCurrentPage, invalidateCache],
  )

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value)
      setCurrentPage(1)
      invalidateCache(true)
    },
    [setSearchValue, setCurrentPage, invalidateCache],
  )

  return {
    handleFilterChange,
    handleSearchChange,
  }
}
