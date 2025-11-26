"use client"

import { useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { Building } from "lucide-react"
import { useSession } from "next-auth/react"
import { useModalClose } from "@/src/hooks/useModalClose"
import { formatBookingId, formatPhoneNumber } from "@/src/lib/format"
import SupplierInfo from "@/src/components/equipment-details/SupplierInfo"
import ModalHeader from "@/src/components/booking/ModalHeader"
import AdminControls from "../bookings/AdminControls"
import { toast } from "sonner"

interface SalesDetailsModalProps {
  sale: any
  isOpen: boolean
  onClose: () => void
  onStatusUpdate: () => void
}

export default function SalesDetailsModal({ sale, isOpen, onClose, onStatusUpdate }: SalesDetailsModalProps) {
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
    <div ref={modalRef} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <ModalHeader title={t("details.title")} onClose={onClose} />

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">{t("details.saleInfo")}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("details.equipment")}</span>
                  <span className="font-medium">{sale.equipmentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("details.salePrice")}</span>
                  <span className="font-semibold" dir="ltr">{sale.salePrice.toLocaleString()} MRU</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">{t("details.commission")}</span>
                  <span className="font-semibold text-green-600" dir="ltr">{sale.commission.toLocaleString()} MRU</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("details.createdAt")}</span>
                  <span className="font-medium">{new Date(sale.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-[280px]">
                <SupplierInfo supplier={sale.buyerInfo[0]} variant="modal" title={t("details.buyerInfo")} />
              </div>

              {sale.supplierInfo && sale.supplierInfo.length > 0 ? (
                <div className="h-[280px]">
                  <SupplierInfo supplier={sale.supplierInfo[0]} variant="modal" />
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 h-[200px] flex flex-col">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Building className="w-5 h-5 text-gray-600" />
                    {t("details.supplierInfo")}
                  </h3>
                  <p className="text-sm text-gray-600">{t("equipment.createdByAdmin")}</p>
                </div>
              )}
            </div>
          </div>

          {sale.buyerMessage && (
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">{t("details.buyerMessage")}</h3>
              <p className="text-sm text-gray-700">{sale.buyerMessage}</p>
            </div>
          )}

          <AdminControls
            status={status}
            onStatusChange={setStatus}
            onSave={() => handleStatusUpdate(session?.user?.id)}
            onCancel={onClose}
            loading={loading}
            isChanged={status !== sale.status}
            labels={{
              status: t("details.status"),
              statusOptions: {
                pending: t("status.pending"),
                paid: t("status.paid"),
                cancelled: t("status.cancelled"),
              },
              cancel: t("actions.cancel"),
              save: t("actions.save"),
              saving: t("actions.saving"),
            }}
          />
        </div>
      </div>
    </div>
  )
}
