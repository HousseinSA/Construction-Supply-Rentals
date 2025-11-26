"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { usePagination } from "@/src/hooks/usePagination"
import { Table, TableHeader, TableBody, TableHead, TableCell } from "@/src/components/ui/Table"
import Pagination from "@/src/components/ui/Pagination"
import { Eye, XCircle } from "lucide-react"
import { Link } from "@/src/i18n/navigation"
import { toast } from "sonner"
import ConfirmModal from "@/src/components/ui/ConfirmModal"
import { AlertTriangle } from "lucide-react"

interface SaleOrder {
  _id: string
  equipmentId: string
  equipmentName: string
  salePrice: number
  status: "pending" | "paid" | "completed" | "cancelled"
  buyerMessage?: string
  createdAt: string
}

export default function RenterPurchasesView() {
  const t = useTranslations("dashboard.purchases")
  const [purchases, setPurchases] = useState<SaleOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null)

  const fetchPurchases = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/sales/my-purchases")
      const data = await response.json()
      if (data.success) {
        setPurchases(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch purchases:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPurchases()
  }, [])

  const { currentPage, totalPages, paginatedData, goToPage, totalItems, itemsPerPage } = 
    usePagination({ data: purchases, itemsPerPage: 10 })

  const handleCancelClick = (purchaseId: string) => {
    setSelectedPurchaseId(purchaseId)
    setShowCancelDialog(true)
  }

  const handleCancelPurchase = async () => {
    if (!selectedPurchaseId) return
    
    setCancellingId(selectedPurchaseId)
    try {
      const response = await fetch("/api/sales", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          saleId: selectedPurchaseId,
          status: "cancelled",
        }),
      })

      if (response.ok) {
        toast.success(t("cancelSuccess"))
        fetchPurchases()
      } else {
        toast.error(t("cancelFailed"))
      }
    } catch (error) {
      toast.error(t("cancelFailed"))
    } finally {
      setCancellingId(null)
      setShowCancelDialog(false)
      setSelectedPurchaseId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"}`}>
        {t(`status.${status}`)}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-pulse text-gray-600 font-medium">{t("loading")}</div>
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
      <div className="hidden lg:block">
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
                  <div className="text-sm font-medium">{purchase.equipmentName}</div>
                </TableCell>
                <TableCell>
                  <span className="font-semibold" dir="ltr">{purchase.salePrice.toLocaleString()} MRU</span>
                </TableCell>
                <TableCell align="center">{getStatusBadge(purchase.status)}</TableCell>
                <TableCell align="center">
                  <span className="text-sm text-gray-600">
                    {new Date(purchase.createdAt).toLocaleDateString()}
                  </span>
                </TableCell>
                <TableCell align="center">
                  <div className="flex items-center justify-center gap-2">
                    <Link href={`/equipment/${purchase.equipmentId}`} className="inline-block p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Eye className="h-4 w-4 text-gray-600" />
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

      <div className="lg:hidden space-y-4">
        {paginatedData.map((purchase) => (
          <div key={purchase._id} className="p-4 space-y-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {purchase.equipmentName}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {new Date(purchase.createdAt).toLocaleDateString()}
                </div>
              </div>
              {getStatusBadge(purchase.status)}
            </div>

            <div className="space-y-3 pt-2 border-t border-gray-200">
              <div>
                <div className="text-xs text-gray-500">{t("table.price")}</div>
                <div className="font-semibold text-gray-900" dir="ltr">{purchase.salePrice.toLocaleString()} MRU</div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/equipment/${purchase.equipmentId}`} className="flex-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm flex items-center justify-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  {t("actions.view")}
                </Link>
                {purchase.status === "pending" && (
                  <button
                    onClick={() => handleCancelClick(purchase._id)}
                    disabled={cancellingId === purchase._id}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    {t("cancelPurchase")}
                  </button>
                )}
              </div>
            </div>
          </div>
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
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelPurchase}
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
