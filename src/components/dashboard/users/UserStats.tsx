"use client"

interface UserStatsProps {
  stats: {
    totalUsers: number
    totalSuppliers: number
    totalRenters: number
  } | null
  t: any
}

export default function UserStats({ stats, t }: UserStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</div>
        <div className="text-sm text-gray-600 mt-1">{t('users.totalUsers')}</div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-3xl font-bold text-green-600">{stats?.totalSuppliers || 0}</div>
        <div className="text-sm text-gray-600 mt-1">{t('users.suppliers')}</div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-3xl font-bold text-blue-600">{stats?.totalRenters || 0}</div>
        <div className="text-sm text-gray-600 mt-1">{t('users.renters')}</div>
      </div>
    </div>
  )
}
