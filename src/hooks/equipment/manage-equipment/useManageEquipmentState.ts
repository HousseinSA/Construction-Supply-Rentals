import { useState } from "react"

interface LocationOption {
  value: string
  label: string
}

interface FilterValues {
  status: string
  listingType: string
  availability: string
  location: string
  [key: string]: string
}

export function useManageEquipmentState() {
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchValue, setSearchValue] = useState("")
  const [filterValues, setFilterValues] = useState<FilterValues>({
    status: "all",
    listingType: "all",
    availability: "all",
    location: "all",
  })
  const [locations, setLocations] = useState<LocationOption[]>([])
  const [isMobile, setIsMobile] = useState(false)

  return {
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    totalCount,
    setTotalCount,
    searchValue,
    setSearchValue,
    filterValues,
    setFilterValues,
    locations,
    setLocations,
    isMobile,
    setIsMobile,
  }
}
