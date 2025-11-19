"use client"

import { useState, useEffect } from "react"
import { useLocale, useTranslations } from "next-intl"
import {
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  User,
  ArrowLeft,
  Building,
  Package,
} from "lucide-react"
import { Link } from "@/src/i18n/navigation"
import { useSession } from "next-auth/react"
import { usePagination } from "@/src/hooks/usePagination"
import BookingDetailsModal from "./BookingDetailsModal"
import Pagination from "@/src/components/ui/Pagination"
import HomeButton from "@/src/components/ui/HomeButton"
import { formatBookingId, formatPhoneNumber } from "@/src/lib/format"
import CopyButton from "@/src/components/ui/CopyButton"

interface Booking {
  _id: string
  renterId: string
  bookingItems: Array<{
    equipmentId: string
    supplierId: string
    equipmentName: string
    rate: number
    usage: number
    subtotal: number
  }>
  totalPrice: number
  status: "pending" | "paid" | "completed" | "cancelled"
  renterMessage?: string
  adminNotes?: string
  createdAt: string
  renterInfo: Array<{
    firstName: string
    lastName: string
    email: string
    phone: string
    location: string
  }>
  supplierInfo: Array<{
    firstName: string
    lastName: string
    email: string
    phone: string
    companyName?: string
  }>
}

export default function BookingTable() {
  const { data: session } = useSession()
  const t = useTranslations("dashboard.bookings")
  const tPages = useTranslations("dashboard.pages")
  const tEquipment = useTranslations("dashboard.equipment")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const locale = useLocale()

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedBookings,
    goToPage,
    totalItems,
    itemsPerPage,
  } = usePagination({ data: bookings, itemsPerPage: 10 })

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings")
      const data = await response.json()
      if (data.success) {
        setBookings(data.data || [])
      } else {
        setError(data.error || "Failed to fetch bookings")
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error)
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
        text: t("status.pending"),
      },
      paid: {
        color: "bg-blue-100 text-blue-800",
        icon: CheckCircle,
        text: t("status.paid"),
      },
      completed: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        text: t("status.completed"),
      },
      cancelled: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        text: t("status.cancelled"),
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    const Icon = config.icon

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {config.text}
      </span>
    )
  }

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowDetailsModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Link
                href="/dashboard"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {tPages("bookings.title")}
                </h1>
                <p className="text-gray-600 text-sm">
                  {tPages("bookings.subtitle")}
                </p>
              </div>
            </div>
            <HomeButton />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {session?.user?.userType === "renter" ? (
            <div className="p-12 text-center">
              <div className="text-gray-500 text-lg mb-4">My Bookings</div>
              <div className="text-gray-400 text-sm">
                Booking history and status updates will be available here soon.
              </div>
            </div>
          ) : loading ? (
            <div className="p-12 text-center">
              <div className="animate-pulse text-gray-600 font-medium">
                {tEquipment("loading")}
              </div>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="text-red-500 text-lg mb-4">Error: {error}</div>
              <button
                onClick={fetchBookings}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-medium">
              {t("noBookings") || "No bookings found"}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t("table.booking") || "Booking"}
                        </th>
                        <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t("table.renter") || "Renter"}
                        </th>
                        <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t("table.equipment") || "Equipment"}
                        </th>
                        <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t("table.total") || "Total"}
                        </th>
                        <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t("table.status") || "Status"}
                        </th>
                        <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t("table.date") || "Date"}
                        </th>
                        <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t("table.actions") || "Actions"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedBookings.map((booking) => (
                        <tr key={booking._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatBookingId(booking._id)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.bookingItems.length}{" "}
                              {t("items") || "items"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User className="h-4 w-4 text-primary" />
                                </div>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {booking.renterInfo[0]?.firstName}{" "}
                                  {booking.renterInfo[0]?.lastName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {booking.renterInfo[0]?.phone}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {booking.bookingItems[0]?.equipmentName}
                              {booking.bookingItems.length > 1 && (
                                <span className="text-gray-500">
                                  {" "}
                                  +{booking.bookingItems.length - 1}{" "}
                                  {t("more") || "more"}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div
                              className={`text-sm flex  ${
                                locale === "ar" ? "justify-end" : "justify-start"
                              } font-medium text-gray-900`}
                              dir="ltr"
                            >
                              {booking.totalPrice.toLocaleString()} MRU
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(booking.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleViewDetails(booking)}
                              className="text-primary hover:text-primary/80 flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              {t("actions.view") || "View"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-gray-200">
                {paginatedBookings.map((booking) => (
                  <div key={booking._id} className="p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          {formatBookingId(booking._id)}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    {/* Equipment */}
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-medium text-green-900">
                          {t("table.equipment") || "Equipment"}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {booking.bookingItems[0]?.equipmentName}
                        {booking.bookingItems.length > 1 && (
                          <span className="text-gray-500">
                            {" "}
                            +{booking.bookingItems.length - 1} {t("more")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Renter */}
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-medium text-blue-900">
                          {t("table.renter") || "Renter"}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {booking.renterInfo[0]?.firstName}{" "}
                        {booking.renterInfo[0]?.lastName}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-600" dir="ltr">
                          {formatPhoneNumber(booking.renterInfo[0]?.phone)}
                        </span>
                        <CopyButton
                          text={booking.renterInfo[0]?.phone}
                          size="sm"
                        />
                      </div>
                    </div>

                    {/* Supplier */}
                    {booking.supplierInfo &&
                      booking.supplierInfo.length > 0 && (
                        <div className="bg-orange-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Building className="h-4 w-4 text-orange-600" />
                            <span className="text-xs font-medium text-orange-900">
                              {t("table.supplier") || "Supplier"}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.supplierInfo[0]?.firstName}{" "}
                            {booking.supplierInfo[0]?.lastName}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-600" dir="ltr">
                              {formatPhoneNumber(
                                booking.supplierInfo[0]?.phone
                              )}
                            </span>
                            <CopyButton
                              text={booking.supplierInfo[0]?.phone}
                              size="sm"
                            />
                          </div>
                        </div>
                      )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <div className="font-semibold text-gray-900" dir="ltr">
                        {booking.totalPrice.toLocaleString()} MRU
                      </div>
                      <button
                        onClick={() => handleViewDetails(booking)}
                        className="px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm flex items-center gap-1.5"
                      >
                        <Eye className="w-4 h-4" />
                        {t("actions.view") || "View"}
                      </button>
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
            </>
          )}
        </div>

        {selectedBooking && (
          <BookingDetailsModal
            booking={selectedBooking}
            isOpen={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false)
              setSelectedBooking(null)
            }}
            onStatusUpdate={fetchBookings}
          />
        )}
      </div>
    </div>
  )
}
