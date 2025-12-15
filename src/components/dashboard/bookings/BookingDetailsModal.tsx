"use client"

import { useRef } from "react"
import { useTranslations } from "next-intl"
import { Building, Save } from "lucide-react"
import { useSession } from "next-auth/react"
import { useBookingDetails } from "@/src/hooks/useBookingDetails"
import { useModalClose } from "@/src/hooks/useModalClose"
import SupplierInfo from "@/src/components/equipment-details/SupplierInfo"
import ModalHeader from "@/src/components/booking/ModalHeader"
import BookingInfo from "./BookingInfo"
import RenterInfo from "./RenterInfo"
import EquipmentItems from "./EquipmentItems"
import RenterMessage from "./RenterMessage"
import StatusManager from "@/src/components/ui/StatusManager"
import Button from "@/src/components/ui/Button"
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
      className="fixed inset-0 z-50 animate-in fade-in duration-150"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-200">
        <div className="p-6">
          <ModalHeader title={t("details.title")} onClose={onClose} />

          <div className="mb-4 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between">
            <div className="text-xs text-gray-600">{t("details.reference")}</div>
            <div className="text-xl font-bold text-orange-600" dir="ltr">{booking.referenceNumber?.slice(0, 3)}-{booking.referenceNumber?.slice(3)}</div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BookingInfo
                  bookingId={booking._id}
                  referenceNumber={booking.referenceNumber}
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
            </div>

            <StatusManager
              currentStatus={booking.status}
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
              {booking.renterInfo && booking.renterInfo[0] && (
                <div className="lg:h-[280px]">
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
                </div>
              )}
              {booking.supplierInfo && booking.supplierInfo.length > 0 && !booking.hasAdminCreatedEquipment && (
                <div className="lg:h-[280px]">
                  <SupplierInfo
                    supplier={booking.supplierInfo[0]}
                    variant="modal"
                  />
                </div>
              )}
            </div>
          </div>

          {booking.renterMessage && (
            <RenterMessage
              message={booking.renterMessage}
              title={t("details.renterMessage")}
            />
          )}

          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                {t("actions.close")}
              </button>
              <Button onClick={() => handleStatusUpdate(session?.user?.id)} disabled={loading || status === originalStatus} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                {loading ? t("actions.saving") : t("actions.save")}
              </Button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
