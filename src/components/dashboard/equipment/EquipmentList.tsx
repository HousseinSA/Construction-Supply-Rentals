import { useEquipmentStore } from "@/src/stores/equipmentStore"
import { useUserSession } from "@/src/hooks/useUserSession"
import { Table, TableHeader, TableBody, TableHead } from "../../ui/Table"
import { EquipmentWithSupplier } from "@/src/lib/models/equipment"
import EquipmentTableRow from "./EquipmentTableRow"
import EquipmentMobileCard from "./EquipmentMobileCard"
import Pagination from "../../ui/Pagination"
import { useEffect, useRef } from "react"
import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

interface EquipmentListProps {
  equipment: EquipmentWithSupplier[]
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onStatusChange: (id: string, action: "approve" | "reject") => void
  onPricingReview?: (item: EquipmentWithSupplier) => void
  mobileEquipment: EquipmentWithSupplier[]
  loadingMoreMobile: boolean
  hasMoreMobile: boolean
  onLoadMoreMobile: () => void
  loading: boolean
}

export default function EquipmentList({
  equipment,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onStatusChange,
  onPricingReview,
  mobileEquipment,
  loadingMoreMobile,
  hasMoreMobile,
  onLoadMoreMobile,
  loading,
}: EquipmentListProps) {
  const { user } = useUserSession()
  const isSupplier = user?.isSupplier ?? false
  const t = useTranslations("dashboard.equipment")
  const tCommon = useTranslations("equipment")
  const sentinelRef = useRef<HTMLDivElement>(null)

  const columnCount = isSupplier ? 7 : 8

  const handlePageChange = (page: number) => {
    onPageChange(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    if (!sentinelRef.current || loading || loadingMoreMobile || !hasMoreMobile) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMoreMobile()
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    observer.observe(sentinelRef.current)

    return () => observer.disconnect()
  }, [loading, loadingMoreMobile, hasMoreMobile])

  return (
    <>
      <div className="hidden xl:block">
        <Table>
          <TableHeader>
            <tr>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("location")}</TableHead>
              <TableHead>{t("price")}</TableHead>
              {!isSupplier && <TableHead>{t("supplierInfo")}</TableHead>}
              <TableHead align="center">{t("createdAt")}</TableHead>
              <TableHead align="center">{t("status")}</TableHead>
              <TableHead align="center">{t("availability")}</TableHead>
              <TableHead align="center">{t("actions")}</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {loading ? (
              <tr>
                <td colSpan={columnCount} className="p-12 text-center">
                  <div className="animate-pulse text-gray-600 font-medium">
                    {t("loading")}
                  </div>
                </td>
              </tr>
            ) : equipment.length === 0 ? (
              <tr>
                <td colSpan={columnCount} className="p-12 text-center text-gray-500 font-medium">
                  {t("noEquipmentFound")}
                </td>
              </tr>
            ) : (
              equipment.map((item) => (
                <EquipmentTableRow
                  key={item._id?.toString()}
                  item={item}
                  onStatusChange={onStatusChange}
                  onPricingReview={onPricingReview}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="xl:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
        {loading ? (
          <div className="p-12 text-center col-span-full">
            <div className="animate-pulse text-gray-600 font-medium">
              {t("loading")}
            </div>
          </div>
        ) : mobileEquipment.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-medium col-span-full">
            {t("noEquipmentFound")}
          </div>
        ) : (
          mobileEquipment.map((item) => (
            <EquipmentMobileCard
              key={item._id?.toString()}
              item={item}
              onStatusChange={onStatusChange}
              onPricingReview={onPricingReview}
            />
          ))
        )}
      </div>

      {hasMoreMobile && (
        <div ref={sentinelRef} className="xl:hidden flex justify-center py-8">
          {loadingMoreMobile ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-sm font-medium text-gray-600">{tCommon("loadingMore")}</span>
            </div>
          ) : (
            <div className="h-8" />
          )}
        </div>
      )}

      <div className="hidden xl:block">
        {!loading && equipment.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            showInfo={true}
          />
        )}
      </div>
    </>
  )
}
