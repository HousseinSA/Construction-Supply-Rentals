"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Coins, Package, Tag } from "lucide-react"
import { useCommissionAnalytics } from "@/src/hooks/useCommissionAnalytics"
import Dropdown from "@/src/components/ui/Dropdown"
import StatCard from "./StatCard"
import EquipmentRankingCard from "./EquipmentRankingCard"
import CategoryProgressBar from "./CategoryProgressBar"
import {
  BOOKING_COMMISSION_RATE,
  SALE_COMMISSION_RATE,
} from "@/src/lib/constants/commission"
import { AnalyticsEarningSkeleton } from "../../equipment/LoadingSkeleton"
import ErrorState from "@/src/components/ui/ErrorState"

export default function PlatformEarnings() {
  const t = useTranslations("dashboard.analytics")
  const [dateFilter, setDateFilter] = useState("last30days")
  const { analytics, loading, error, refetch } = useCommissionAnalytics(dateFilter)

  const dateFilterOptions = useMemo(
    () => [
      { value: "today", label: t("commission.filters.today") },
      { value: "last7days", label: t("commission.filters.last7days") },
      { value: "last30days", label: t("commission.filters.last30days") },
      { value: "thisMonth", label: t("commission.filters.thisMonth") },
      { value: "lastMonth", label: t("commission.filters.lastMonth") },
      { value: "last3months", label: t("commission.filters.last3months") },
      { value: "last6months", label: t("commission.filters.last6months") },
      { value: "thisYear", label: t("commission.filters.thisYear") },
      { value: "allTime", label: t("commission.filters.allTime") },
    ],
    [t],
  )

  const { totalCommission, maxCommission } = useMemo(() => {
    if (!analytics) return { totalCommission: 0, maxCommission: 1 }
    return {
      totalCommission: analytics.overview.totalCommission,
      maxCommission: Math.max(
        ...analytics.categoryBreakdown.map((c) => c.totalCommission),
        1,
      ),
    }
  }, [analytics])

  if (loading) {
    return <AnalyticsEarningSkeleton />
  }

  if (error) {
    return <ErrorState onRetry={refetch} />
  }

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
        <StatCard
          title={t("commission.totalCommission")}
          value={totalCommission}
          subtitle={t("commission.transactions")}
          subtitleValue={analytics.overview.totalTransactions}
          icon={Coins}
          colorScheme="total"
        />

        <StatCard
          title={t("commission.bookingCommission")}
          value={analytics.overview.bookingCommission}
          subtitle={t("commission.bookings")}
          subtitleValue={analytics.overview.totalBookings}
          badge={`${(BOOKING_COMMISSION_RATE * 100).toFixed(0)}%`}
          icon={Package}
          colorScheme="booking"
        />

        <StatCard
          title={t("commission.saleCommission")}
          value={analytics.overview.saleCommission}
          subtitle={t("commission.sales")}
          subtitleValue={analytics.overview.totalSales}
          badge={`${(SALE_COMMISSION_RATE * 100).toFixed(0)}%`}
          icon={Tag}
          colorScheme="sale"
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("commission.commissionByCategory")}
        </h3>
        {analytics.categoryBreakdown.length > 0 ? (
          <div className="space-y-4">
            {analytics.categoryBreakdown.map((category, index) => {
              const percentage =
                (category.totalCommission / totalCommission) * 100
              const barWidth = (category.totalCommission / maxCommission) * 100

              return (
                <CategoryProgressBar
                  key={category.categoryId}
                  category={category}
                  percentage={percentage}
                  barWidth={barWidth}
                  colorIndex={index}
                />
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
        <EquipmentRankingCard
          title={t("commission.topBookedEquipment")}
          equipment={analytics.topBookedEquipment}
          colorScheme="booking"
          emptyMessage={t("commission.noBookingData")}
        />

        <EquipmentRankingCard
          title={t("commission.topSoldEquipment")}
          equipment={analytics.topSoldEquipment}
          colorScheme="sale"
          emptyMessage={t("commission.noSaleData")}
        />
      </div>
    </div>
  )
}
