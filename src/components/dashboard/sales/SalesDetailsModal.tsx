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
  const tBooking = useTranslations("booking")
  const tDashboard = useTranslations("dashboard")
  const { data: session } = useSession()
  const [status, setStatus] = useState(sale.status)
  const [loading, setLoading] = useState(false)

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

  return (
    <BaseDetailsModal
      isOpen={isOpen}
      onClose={onClose}
      title={t("details.title")}
      referenceNumber={sale.referenceNumber}
      referenceLabel={t("details.reference")}
      onUpdate={() => handleStatusUpdate(session?.user?.id)}
      updateDisabled={loading || status === sale.status}
      updateLoading={loading}
      updateLabel={t("actions.updateSale")}
      updatingLabel={t("actions.updating")}
      closeLabel={t("actions.close")}
    >
      <TransactionInfoCard
        title={t("details.saleInfo")}
        rows={[
          {
            label: t("details.equipment"),
            value: sale.equipmentName,
          },
          {
            label: t("details.salePrice"),
            value: `${sale.salePrice.toLocaleString()} MRU`,
            dir: "ltr",
            highlight: true,
          },
          ...(sale.transportDetails ? [
            {
              label: `🚛 ${sale.transportDetails.porteCharName}`,
              value: `${sale.transportDetails.distance} ${tBooking("km")}`,
              dir: "ltr" as const,
            },
            {
              label: tBooking("ratePerKm"),
              value: `${sale.transportDetails.ratePerKm.toLocaleString()} MRU/${tBooking("km")}`,
              dir: "ltr" as const,
            },
            {
              label: tBooking("transportCost"),
              value: `${sale.transportDetails.transportCost.toLocaleString()} MRU`,
              dir: "ltr" as const,
              highlight: true,
            },
          ] : []),
          {
            label: t("table.total"),
            value: `${(sale.grandTotal || sale.salePrice).toLocaleString()} MRU`,
            dir: "ltr",
            highlight: true,
          },
          {
            label: `${t("details.commission")} (5%)`,
            value: `${sale.commission.toLocaleString()} MRU`,
            highlight: true,
            dir: "ltr",
          },
          {
            label: t("details.createdAt"),
            value: new Date(sale.createdAt).toLocaleDateString(),
          },
        ]}
      />

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ContactCard
          user={sale.buyerInfo?.[0]}
          title={t("details.buyerInfo")}
          variant="buyer"
        />
        <ContactCard
          user={sale.supplierInfo?.[0]}
          title={t("details.supplierInfo")}
          variant="supplier"
          adminCreated={!sale.supplierInfo?.[0]}
          adminLabel={tDashboard("equipment.createdByAdmin")}
        />
      </div>

      {sale.buyerMessage && (
        <MessageSection
          message={sale.buyerMessage}
          title={t("details.buyerMessage")}
          variant="buyer"
        />
      )}
    </BaseDetailsModal>
  )
}
