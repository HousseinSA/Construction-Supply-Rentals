"use client"

import { useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { Building, Save } from "lucide-react"
import { useSession } from "next-auth/react"
import { useModalClose } from "@/src/hooks/useModalClose"
import { formatBookingId, formatPhoneNumber } from "@/src/lib/format"
import SupplierInfo from "@/src/components/equipment-details/SupplierInfo"
import ModalHeader from "@/src/components/booking/ModalHeader"
import StatusManager from "@/src/components/ui/StatusManager"
import Button from "@/src/components/ui/Button"
import { toast } from "sonner"

interface SalesDetailsModalProps {
  sale: any
  isOpen: boolean
  onClose: () => void
  onStatusUpdate: () => void
}

export default function SalesDetailsModal({
  sale,
  isOpen,
  onClose,
  onStatusUpdate,
}: SalesDetailsModalProps) {
  const t = useTranslations("dashboard.sales")
  const { data: session } = useSession()
  const modalRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState(sale.status)
  const [loading, setLoading] = useState(false)

  useModalClose(isOpen, onClose, modalRef)

  const handleStatusUpdate = async (adminId?: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/sales", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saleId: sale._id, status, adminId }),
      })

      if (response.ok) {
        toast.success(t("statusUpdated"))
        onStatusUpdate()
        onClose()
      } else {
        toast.error(t("statusUpdateFailed"))
      }
    } catch (error) {
      toast.error(t("statusUpdateFailed"))
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <ModalHeader title={t("details.title")} onClose={onClose} />

          <div className="mb-4 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between">
            <div className="text-xs text-gray-600">{t("details.reference")}</div>
            <div className="text-xl font-bold text-orange-600" dir="ltr">{sale.referenceNumber?.slice(0, 3)}-{sale.referenceNumber?.slice(3)}</div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">{t("details.saleInfo")}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {t("details.equipment")}
                  </span>
                  <span className="font-medium">{sale.equipmentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {t("details.salePrice")}
                  </span>
                  <span className="font-semibold" dir="ltr">
                    {sale.salePrice.toLocaleString()} MRU
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">
                    {t("details.commission")}
                  </span>
                  <span className="font-semibold text-green-600" dir="ltr">
                    {sale.commission.toLocaleString()} MRU
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {t("details.createdAt")}
                  </span>
                  <span className="font-medium">
                    {new Date(sale.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <StatusManager
              currentStatus={sale.status}
              selectedStatus={status}
              onStatusChange={setStatus}
              labels={{
                title: t("details.status"),
                currentStatus: t("details.status"),
                statusOptions: {
                  pending: t("status.pending"),
                  paid: t("status.paid"),
                  completed: t("status.completed"),
                  cancelled: t("status.cancelled"),
                },
              }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-[280px]">
                <SupplierInfo
                  supplier={sale.buyerInfo[0]}
                  variant="modal"
                  title={t("details.buyerInfo")}
                />
              </div>

              {sale.supplierInfo && sale.supplierInfo.length > 0 ? (
                <div className="h-[280px]">
                  <SupplierInfo
                    supplier={sale.supplierInfo[0]}
                    variant="modal"
                  />
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 h-[200px] flex flex-col">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Building className="w-5 h-5 text-gray-600" />
                    {t("details.supplierInfo")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("equipment.createdByAdmin")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {sale.buyerMessage && (
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">
                {t("details.buyerMessage")}
              </h3>
              <p className="text-sm text-gray-700">{sale.buyerMessage}</p>
            </div>
          )}

          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                {t("actions.close")}
              </button>
              <Button
                onClick={() => handleStatusUpdate(session?.user?.id)}
                disabled={loading || status === sale.status}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? t("actions.updating") : t("actions.updateSale")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
