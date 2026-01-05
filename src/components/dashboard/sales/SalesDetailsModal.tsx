"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import BaseDetailsModal from "@/src/components/shared/BaseDetailsModal"
import ContactCard from "@/src/components/shared/ContactCard"
import MessageSection from "@/src/components/shared/MessageSection"
import TransactionInfoCard from "@/src/components/shared/TransactionInfoCard"
import StatusManager from "@/src/components/ui/StatusManager"
import PriceDisplay from "@/src/components/ui/PriceDisplay"

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
  const t = useTranslations("dashboard.sales.details")
  const tStatus = useTranslations("dashboard.sales.status")
  const tActions = useTranslations("dashboard.sales.actions")
  const tTable = useTranslations("dashboard.sales.table")
  const tSales = useTranslations("dashboard.sales")
  const tDashboard = useTranslations("dashboard")
  const { data: session } = useSession()
  const [status, setStatus] = useState(sale.status)
  const [loading, setLoading] = useState(false)
  
  const isAdminOwned = sale.isAdminOwned || (!sale.supplierInfo || sale.supplierInfo.length === 0)

  const handleStatusUpdate = async (adminId?: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/sales", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saleId: sale._id, status, adminId }),
      })

      if (response.ok) {
        toast.success(tSales("statusUpdated"))
        onStatusUpdate()
        onClose()
      } else {
        toast.error(tSales("statusUpdateFailed"))
      }
    } catch (error) {
      toast.error(tSales("statusUpdateFailed"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <BaseDetailsModal
      isOpen={isOpen}
      onClose={onClose}
      title={t("title")}
      referenceNumber={sale.referenceNumber}
      referenceLabel={t("reference")}
      onUpdate={() => handleStatusUpdate(session?.user?.id)}
      updateDisabled={loading || status === sale.status}
      updateLoading={loading}
      updateLabel={tActions("updateSale")}
      updatingLabel={tActions("updating")}
      closeLabel={tActions("close")}
    >
      <div className="bg-gray-50 py-4 border-b border-gray-200 -mx-6 px-6">
        <div>
          <div className="text-xs font-medium text-gray-600 mb-2">{t("createdAt")}</div>
          <div className="text-sm font-semibold text-gray-900">
            {new Date(sale.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
      <TransactionInfoCard
        title={t("saleInfo")}
        rows={[
          {
            label: t("equipment"),
            value: sale.equipmentName,
          },
          {
            label: t("salePrice"),
            value: <PriceDisplay amount={sale.salePrice} />,
            dir: "ltr",
            highlight: true,
          },
          {
            label: tTable("total"),
            value: <PriceDisplay amount={sale.grandTotal || sale.salePrice} />,
            dir: "ltr",
            highlight: true,
          },
          {
            label: t("commission"),
            value: <PriceDisplay amount={sale.commission} suffix="/(5%)" variant="commission" />,
            highlight: true,
            dir: "ltr",
          },
        ]}
      />

      <StatusManager
        currentStatus={sale.status}
        selectedStatus={status}
        onStatusChange={setStatus}
        labels={{
          title: t("status"),
          currentStatus: t("status"),
          statusOptions: {
            pending: tStatus("pending"),
            paid: tStatus("paid"),
            completed: tStatus("completed"),
            cancelled: tStatus("cancelled"),
          },
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ContactCard
          user={sale.buyerInfo?.[0]}
          title={t("buyerInfo")}
          variant="buyer"
        />
        <ContactCard
          user={sale.supplierInfo?.[0]}
          title={t("supplierInfo")}
          variant="supplier"
          adminCreated={isAdminOwned}
          adminLabel={tDashboard("equipment.createdByAdmin")}
        />
      </div>

      {sale.buyerMessage && (
        <MessageSection
          message={sale.buyerMessage}
          title={t("buyerMessage")}
          variant="buyer"
        />
      )}
    </BaseDetailsModal>
  )
}
