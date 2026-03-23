let statsCache: any = null
let statsCacheTime = 0
const STATS_CACHE_DURATION = 5 * 60 * 1000

export function validatePagination(page: string | null, limit: string | null) {
  const validPage = Math.max(1, parseInt(page || '1') || 1)
  const validLimit = Math.min(100, Math.max(1, parseInt(limit || '10') || 10))
  return { 
    page: validPage, 
    limit: validLimit, 
    skip: (validPage - 1) * validLimit 
  }
}

export function buildUserQuery(search: string, role: string | null) {
  const query: any = {
    role: { $ne: 'admin' }
  }
  
  if (role && role !== 'all') {
    query.userType = role
  }

  if (search.trim()) {
    query.$text = { $search: search }
  }
  
  return query
}

export function formatUserStats(statsData: any[]) {
  let supplierCount = 0
  let renterCount = 0
  
  for (const stat of statsData) {
    if (stat._id === 'supplier') supplierCount = stat.count
    else if (stat._id === 'renter') renterCount = stat.count
  }
  
  return {
    totalUsers: supplierCount + renterCount,
    totalSuppliers: supplierCount,
    totalRenters: renterCount,
  }
}

export function shouldRefreshStats(): boolean {
  return !statsCache || Date.now() - statsCacheTime > STATS_CACHE_DURATION
}

export function getCachedStats() {
  return statsCache
}

export function updateStatsCache(stats: any) {
  statsCache = stats
  statsCacheTime = Date.now()
}

export function buildUserAggregation(query: any, skip: number, limit: number, includeStats = true) {
  const facets: any = {
    users: [
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      { $project: { password: 0 } }
    ],
    totalCount: [{ $count: 'count' }]
  }
  
  return [
    { $match: query },
    { $facet: facets }
  ]
}

export function validateUserStatus(status: string): boolean {
  return ['approved', 'blocked'].includes(status)
}

export function parseEmailOrPhone(emailOrPhone: string) {
  const isEmail = emailOrPhone.includes('@')
  return {
    isEmail,
    query: isEmail ? { email: emailOrPhone } : { phone: emailOrPhone }
  }
}
