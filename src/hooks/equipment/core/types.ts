export interface EquipmentFetchConfig {
  buildParams: (page: number, itemsPerPage: number) => URLSearchParams
  itemsPerPage: number
  dependencies: any[]
  cacheKey: string
  onSuccess?: (data: any[], pagination?: any) => void
  onError?: (error: Error) => void
}

export interface EquipmentCacheConfig {
  cacheKey: string
  getCached: (key: string) => any[] | null
  setCached: (key: string, data: any[]) => void
  shouldRefetch: (key: string) => boolean
}

export interface FetchResult {
  data: any[]
  pagination?: {
    totalPages: number
    totalCount: number
    hasMore: boolean
  }
}
