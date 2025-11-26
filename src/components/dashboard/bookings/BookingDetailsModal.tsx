"use client"

import { useRef } from "react"
import { useTranslations } from "next-intl"
import { Building } from "lucide-react"
import { useSession } from "next-auth/react"
import { useBookingDetails } from "@/src/hooks/useBookingDetails"
import { useModalClose } from "@/src/hooks/useModalClose"
import SupplierInfo from "@/src/components/equipment-details/SupplierInfo"
import ModalHeader from "@/src/components/booking/ModalHeader"
import BookingInfo from "./BookingInfo"
import RenterInfo from "./RenterInfo"
import EquipmentItems from "./EquipmentItems"
import RenterMessage from "./RenterMessage"
import AdminControls from "./AdminControls"
import type { BookingWithDetails } from "@/src/stores/bookingsStore"

interface BookingDetailsModalProps {
  booking: BookingWithDetails
  isOpen: boolean
  onClose: () => void
  onStatusUpdate: () => void
}

export default function BookingDetailsModal({
  booking,
  isOpen,
  onClose,
  onStatusUpdate,
}: BookingDetailsModalProps) {
  const t = useTranslations("dashboard.bookings")
  const tBooking = useTranslations("booking")
  const { data: session } = useSession()
  const modalRef = useRef<HTMLDivElement>(null)
  const {
    status,
    setStatus,
    loading,
    handleStatusUpdate,
    calculateCommission,
    totalCommission,
    originalStatus,
  } = useBookingDetails(booking, onStatusUpdate, onClose)

  useModalClose(isOpen, onClose, modalRef)

  if (!isOpen) return null

  const getUsageUnitLabel = (unit: string) => {
    const unitMap: Record<string, string> = {
      hours: tBooking("hours"),
      days: tBooking("days") || "days",
      km: tBooking("km"),
      tons: tBooking("tons"),
    }
    return unitMap[unit] || unit
  }

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <ModalHeader title={t("details.title")} onClose={onClose} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BookingInfo
                bookingId={booking._id}
                totalPrice={booking.totalPrice}
                commission={totalCommission}
                createdAt={booking.createdAt}
                labels={{
                  title: t("details.bookingInfo"),
                  bookingId: t("details.bookingId"),
                  totalAmount: t("details.totalAmount"),
                  commission: t("details.commission"),
                  createdAt: t("details.createdAt"),
                }}
              />
              <EquipmentItems
                items={booking.bookingItems}
                calculateCommission={calculateCommission}
                getUsageLabel={getUsageUnitLabel}
                labels={{
                  title: t("details.equipmentItems"),
                  usage: t("details.usage"),
                  rate: t("details.rate"),
                  commission: t("details.commission"),
                  subtotal: t("details.subtotal"),
                }}
              />

              <RenterInfo
                renter={booking.renterInfo[0]}
                labels={{
                  title: t("details.renterInfo"),
                  name: t("details.name"),
                  email: t("details.email"),
                  phone: t("details.phone"),
                  call: t("details.call"),
                }}
              />
              {booking.supplierInfo && booking.supplierInfo.length > 0 && (
                <div className="h-[280px]">
                  <SupplierInfo
                    supplier={booking.supplierInfo[0]}
                    variant="modal"
                  />
                </div>
              )}
          </div>

          {booking.renterMessage && (
            <RenterMessage
              message={booking.renterMessage}
              title={t("details.renterMessage")}
            />
          )}

          <AdminControls
            status={status}
            onStatusChange={setStatus}
            onSave={() => handleStatusUpdate(session?.user?.id)}
            onCancel={onClose}
            loading={loading}
            isChanged={status !== originalStatus}
            labels={{
              status: t("details.status"),
              statusOptions: {
                pending: t("status.pending"),
                paid: t("status.paid"),
                completed: t("status.completed"),
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
