"use client"

import { useTranslations } from "next-intl"
import { usePurchases } from "@/src/hooks/usePurchases"
import { usePagination } from "@/src/hooks/usePagination"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableCell,
} from "@/src/components/ui/Table"
import Pagination from "@/src/components/ui/Pagination"
import { Eye, XCircle } from "lucide-react"
import EquipmentImage from "@/src/components/ui/EquipmentImage"
import { Link } from "@/src/i18n/navigation"
import ConfirmModal from "@/src/components/ui/ConfirmModal"
import { AlertTriangle } from "lucide-react"
import GenericMobileCard from "@/src/components/ui/GenericMobileCard"
import ReferenceNumber from "@/src/components/ui/ReferenceNumber"
import { useTransactionCancel } from "@/src/hooks/useTransactionCancel"
import { formatDate } from "@/src/lib/table-utils"
import PriceDisplay from "@/src/components/ui/PriceDisplay"

export default function RenterPurchasesView() {
  const t = useTranslations("dashboard.purchases")
  const { purchases, loading } = usePurchases()

  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    totalItems,
    itemsPerPage,
  } = usePagination({ data: purchases, itemsPerPage: 10 })

  const {
    cancellingId,
    showDialog,
    setShowDialog,
    handleCancelClick,
    handleConfirm,
  } = useTransactionCancel("purchase", () => {}, {
    cancelSuccess: t("cancelSuccess"),
    cancelFailed: t("cancelFailed"),
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
    }
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"
        }`}
      >
        {t(`status.${status}`)}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-pulse text-gray-600 font-medium">
          {t("loading")}
        </div>
      </div>
    )
  }

  if (purchases.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="text-gray-500 text-lg mb-2">{t("noPurchases")}</div>
        <div className="text-gray-400 text-sm">{t("noPurchasesDesc")}</div>
      </div>
    )
  }

  return (
    <>
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader>
            <tr>
              <TableHead>{t("table.equipment")}</TableHead>
              <TableHead>{t("table.price")}</TableHead>
              <TableHead align="center">{t("table.status")}</TableHead>
              <TableHead align="center">{t("table.date")}</TableHead>
              <TableHead align="center">{t("table.actions")}</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {paginatedData.map((purchase) => (
              <tr key={purchase._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <EquipmentImage
                      src={purchase.equipmentImage || []}
                      alt={purchase.equipmentName}
                      size="lg"
                    />
                    <div className="space-y-0.5 flex-1">
                      <div className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {purchase.equipmentName}
                      </div>
                      <div className="flex items-center gap-2">
                        <ReferenceNumber referenceNumber={purchase.referenceNumber} size="md" />
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                    <PriceDisplay amount={purchase.salePrice}/>
                </TableCell>
                <TableCell align="center">
                  {getStatusBadge(purchase.status)}
                </TableCell>
                <TableCell align="center">
                  <span className="text-sm text-gray-600 whitespace-nowrap" dir="ltr">
                    {formatDate(purchase.createdAt)}
                  </span>
                </TableCell>
                <TableCell align="center">
                  <div className="flex items-center justify-center gap-2 min-w-[80px]">
                    <Link
                      href={`/equipment/${purchase.equipmentId}`}
                      className="inline-block p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Eye className="h-5 w-5 text-gray-600" />
                    </Link>
                    {purchase.status === "pending" && (
                      <button
                        onClick={() => handleCancelClick(purchase._id)}
                        disabled={cancellingId === purchase._id}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 group"
                        title={t("cancelPurchase")}
                      >
                        <XCircle className="h-5 w-5 text-red-600 group-hover:text-red-700" />
                      </button>
                    )}
                  </div>
                </TableCell>
              </tr>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedData.map((purchase) => (
          <GenericMobileCard
            key={purchase._id}
            id={purchase.referenceNumber || ""}
            title={purchase.equipmentName}
            date={formatDate(purchase.createdAt)}
            status={purchase.status}
            image={
              <EquipmentImage
                src={purchase.equipmentImage || []}
                alt={purchase.equipmentName}
                size="lg"
                onClick={() => { window.location.href = `/equipment/${purchase.equipmentId}` }}
              />
            }
            fields={[
              {
                label: t("table.price"),
                value: <PriceDisplay amount={purchase.salePrice} />,
              },
            ]}
            onViewDetails={() => {
              window.location.href = `/equipment/${purchase.equipmentId}`
            }}
            viewButtonText={t("actions.view")}
            actionButton={
              purchase.status === "pending" ? (
                <button
                  onClick={() => handleCancelClick(purchase._id)}
                  disabled={cancellingId === purchase._id}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 group"
                  title={t("cancelPurchase")}
                >
                  <XCircle className="h-5 w-5 text-red-600 group-hover:text-red-700" />
                </button>
              ) : undefined
            }
          />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        showInfo={true}
      />

      <ConfirmModal
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onConfirm={handleConfirm}
        title={t("cancelPurchaseTitle")}
        message={t("cancelPurchaseMessage")}
        confirmText={t("confirmCancel")}
        cancelText={t("actions.cancel")}
        icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
        iconBgColor="bg-red-100"
        isLoading={cancellingId !== null}
      />
    </>
  )
}
