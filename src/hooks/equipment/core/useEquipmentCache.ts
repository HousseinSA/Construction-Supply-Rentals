import { useCallback, useMemo } from "react"
import type { EquipmentCacheConfig } from "./types"

export function useEquipmentCache(config: EquipmentCacheConfig) {
  const { cacheKey, getCached, setCached, shouldRefetch } = config

  const cachedData = useMemo(() => {
    return getCached(cacheKey) || []
  }, [cacheKey, getCached])

  const needsRefetch = useMemo(() => {
    return shouldRefetch(cacheKey)
  }, [cacheKey, shouldRefetch])

  const updateCache = useCallback(
    (data: any[]) => {
      if (data.length > 0) {
        setCached(cacheKey, data)
      }
    },
    [cacheKey, setCached]
  )

  return {
    cachedData,
    needsRefetch,
    updateCache,
  }
}
