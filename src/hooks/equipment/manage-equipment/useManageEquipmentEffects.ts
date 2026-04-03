import { useEffect, useRef } from "react"
import { useEquipmentStore } from "@/src/stores/equipmentStore"

const DEBOUNCE_DELAY = 500

export function useManageEquipmentEffects(
  fetchLocations: () => Promise<string[]>,
  fetchEquipment: (skipCache?: boolean, isPolling?: boolean) => Promise<void>,
  setLocations: (locations: Array<{ value: string; label: string }>) => void,
  isMobile: boolean,
  setIsMobile: (mobile: boolean) => void,
  currentPage: number,
  setCurrentPage: (page: number) => void,
  searchValue: string,
  filterValues: any,
  supplierId: string | undefined,
  convertToLocalized: (location: string) => string,
  onPricingReview: ((item: any) => void) | undefined,
  mobileInfiniteScroll: any,
) {
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const fetchEquipmentRef = useRef<(skipCache?: boolean) => Promise<void>>(async () => {})

  const {
    setIsSupplier,
    setConvertToLocalized,
    setOnPricingReview,
  } = useEquipmentStore()

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1280
      if (mobile !== isMobile) {
        setIsMobile(mobile)
        if (mobile && currentPage > 1) {
          setCurrentPage(1)
        }
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [isMobile, currentPage, setIsMobile, setCurrentPage])

  useEffect(() => {
    fetchLocations().then((data) => {
      setLocations(data.map((loc: string) => ({ 
        value: loc, 
        label: convertToLocalized(loc) 
      })))
    })
  }, [fetchLocations, setLocations, convertToLocalized])

  useEffect(() => {
    setIsSupplier(!!supplierId)
    setConvertToLocalized(convertToLocalized)
    if (onPricingReview) setOnPricingReview(onPricingReview)
  }, [supplierId, convertToLocalized, onPricingReview, setIsSupplier, setConvertToLocalized, setOnPricingReview])

  useEffect(() => {
    fetchEquipmentRef.current = fetchEquipment
  }, [fetchEquipment])

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(() => {
      fetchEquipmentRef.current(true)
    }, DEBOUNCE_DELAY)
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [searchValue, filterValues, currentPage, supplierId])
}
