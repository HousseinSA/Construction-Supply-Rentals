"use client"

import { useTranslations } from "next-intl"
import { Users, Package, MapPin } from "lucide-react"
import { useAnalytics } from "@/src/hooks/useAnalytics"

export default function AnalyticsManagement() {
  const t = useTranslations("dashboard")
  const { analytics, loading } = useAnalytics()

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg p-6 border border-gray-200"
            >
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!analytics) return null

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("analytics.metrics.totalUsers")}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.overview.totalUsers}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("analytics.metrics.totalEquipment")}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.overview.totalEquipment}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Package className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("analytics.metrics.activeEquipment")}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.overview.activeEquipment}
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <Package className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("analytics.metrics.newUsersThisMonth")}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.overview.newUsersThisMonth}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equipment by City */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t("analytics.equipmentByCity")}
          </h3>
          <div className="space-y-3">
            {analytics.equipmentByCity.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm capitalize text-gray-600">
                  {item.city}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (item.count / analytics.overview.totalEquipment) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Roles */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("analytics.userRoles")}
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.usersByRole).length > 0 ? (
              Object.entries(analytics.usersByRole).map(([role, count]) => {
                const totalUsers = Object.values(analytics.usersByRole).reduce(
                  (sum, c) => sum + c,
                  0
                )
                let roleLabel = role
                if (role === "supplier") {
                  roleLabel = t("dashboard.users.roles.supplier")
                } else if (role === "renter") {
                  roleLabel = t("dashboard.users.roles.renter")
                }
                return (
                  <div key={role} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{roleLabel}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${(count / totalUsers) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">
                        {count}
                      </span>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                {t("dashboard.users.noUsers")}
              </p>
            )}
          </div>
        </div>

        {/* Top Suppliers */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("analytics.topPartners")}
          </h3>
          <div className="space-y-3">
            {analytics.topSuppliers.length > 0 ? (
              analytics.topSuppliers.map((supplier, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {supplier.companyName || supplier.name}
                    </p>
                    <p className="text-xs text-gray-500">{supplier.name}</p>
                  </div>
                  <span className="text-sm font-bold text-blue-600">
                    {supplier.equipmentCount} {t("analytics.equipmentCount")}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                {t("analytics.noPartners")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
