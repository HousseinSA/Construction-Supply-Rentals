"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Coins, Package, Tag, Calendar } from "lucide-react"
import { useCommissionAnalytics } from "@/src/hooks/useCommissionAnalytics"
import PriceDisplay from "@/src/components/ui/PriceDisplay"
import Dropdown from "@/src/components/ui/Dropdown"

export default function PlatformEarnings() {
  const t = useTranslations("dashboard.analytics")
  const [dateFilter, setDateFilter] = useState("last30days")
  const { analytics, loading } = useCommissionAnalytics(dateFilter)

  const dateFilterOptions = [
    { value: "today", label: t("commission.filters.today") },
    { value: "last7days", label: t("commission.filters.last7days") },
    { value: "last30days", label: t("commission.filters.last30days") },
    { value: "thisMonth", label: t("commission.filters.thisMonth") },
    { value: "lastMonth", label: t("commission.filters.lastMonth") },
    { value: "last3months", label: t("commission.filters.last3months") },
    { value: "last6months", label: t("commission.filters.last6months") },
    { value: "thisYear", label: t("commission.filters.thisYear") },
    { value: "allTime", label: t("commission.filters.allTime") },
  ]

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="w-48 h-10 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!analytics) return null

  const totalCommission = analytics.overview.totalCommission
  const maxCommission = Math.max(...analytics.categoryBreakdown.map(c => c.totalCommission), 1)

  return (
    <div className="space-y-6">
        <div className="w-full sm:w-64">
          <Dropdown
            options={dateFilterOptions}
            value={dateFilter}
            onChange={setDateFilter}
            placeholder={t("commission.filters.last30days")}
            compact
          />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">
                {t("commission.totalCommission")}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                <PriceDisplay amount={totalCommission} amountClassName="text-2xl font-bold text-gray-900" />
              </p>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-900">{analytics.overview.totalTransactions}</span> {t("commission.transactions")}
                </p>
              </div>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Coins className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">
                {t("commission.bookingCommission")}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                <PriceDisplay amount={analytics.overview.bookingCommission} amountClassName="text-2xl font-bold text-gray-900" />
              </p>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-blue-600 text-base">{analytics.overview.totalBookings}</span> {t("commission.bookings")}
                </p>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">10%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">
                {t("commission.saleCommission")}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                <PriceDisplay amount={analytics.overview.saleCommission} amountClassName="text-2xl font-bold text-gray-900" />
              </p>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-green-600 text-base">{analytics.overview.totalSales}</span> {t("commission.sales")}
                </p>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">5%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Tag className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("commission.commissionByCategory")}
        </h3>
        {analytics.categoryBreakdown.length > 0 ? (
          <div className="space-y-4">
            {analytics.categoryBreakdown.map((category, index) => {
              const percentage = (category.totalCommission / totalCommission) * 100
              const barWidth = (category.totalCommission / maxCommission) * 100

              return (
                <div key={category.categoryId}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {category.categoryName}
                    </span>
                    <span className="text-sm text-gray-600">
                      <PriceDisplay amount={category.totalCommission} amountClassName="text-sm text-gray-600" /> ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        index === 0
                          ? "bg-blue-500"
                          : index === 1
                          ? "bg-green-500"
                          : index === 2
                          ? "bg-purple-500"
                          : "bg-orange-500"
                      }`}
                      style={{ width: `${barWidth}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">
            {t("commission.noCategoryData")}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("commission.topBookedEquipment")}
          </h3>
          {analytics.topBookedEquipment?.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {analytics.topBookedEquipment.map((equipment: any, index: number) => (
                <div key={equipment.equipmentId} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-white">#{index + 1}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 truncate">{equipment.equipmentName}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-2xl font-bold text-blue-600">{equipment.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">
              {t("commission.noBookingData")}
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("commission.topSoldEquipment")}
          </h3>
          {analytics.topSoldEquipment?.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {analytics.topSoldEquipment.map((equipment: any, index: number) => (
                <div key={equipment.equipmentId} className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-white">#{index + 1}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 truncate">{equipment.equipmentName}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-2xl font-bold text-green-600">{equipment.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">
              {t("commission.noSaleData")}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
