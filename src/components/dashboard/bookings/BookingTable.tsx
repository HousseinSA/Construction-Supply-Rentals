"use client"

import { useState, useMemo, useEffect } from "react"
import { useTranslations } from "next-intl"
import { ArrowLeft } from "lucide-react"
import { Link } from "@/src/i18n/navigation"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { usePagination } from "@/src/hooks/usePagination"
import { useBookings } from "@/src/hooks/useBookings"
import { useTableFilters } from "@/src/hooks/useTableFilters"
import BookingDetailsModal from "./BookingDetailsModal"
import BookingTableRow from "./BookingTableRow"
import BookingMobileCard from "./BookingMobileCard"
import RenterBookingView from "./RenterBookingView"
import Pagination from "@/src/components/ui/Pagination"
import HomeButton from "@/src/components/ui/HomeButton"
import TableFilters from "@/src/components/ui/TableFilters"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
} from "@/src/components/ui/Table"
import type { BookingWithDetails } from "@/src/stores/bookingsStore"

export default function BookingTable() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const highlightRef = searchParams.get("highlight")
  const t = useTranslations("dashboard.bookings")
  const tPages = useTranslations("dashboard.pages")
  const tEquipment = useTranslations("dashboard.equipment")
  const { bookings, loading, error, fetchBookings } = useBookings()
  const [selectedBooking, setSelectedBooking] =
    useState<BookingWithDetails | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [highlightId, setHighlightId] = useState<string | null>(null)

  const {
    searchValue,
    setSearchValue,
    filterValues,
    handleFilterChange,
    filteredData: baseFiltered,
  } = useTableFilters({
    data: bookings,
    searchFields: [],
    filterFunctions: {
      status: (booking, value) => booking.status === value,
      date: (booking, value) => {
        const bookingDate = new Date(booking.createdAt)
        const now = new Date()
        const daysDiff = Math.floor(
          (now.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24)
        )
        if (value === "today") return daysDiff === 0
        if (value === "week") return daysDiff <= 7
        if (value === "month") return daysDiff <= 30
        return true
      },
    },
    defaultFilters: {
      status: "all",
      date: "all",
    },
  })

  const filteredData = useMemo(() => {
    if (!searchValue.trim()) return baseFiltered
    const searchLower = searchValue.toLowerCase()
    return baseFiltered.filter((booking) => {
      const renterMatch =
        booking.renterInfo &&
        (booking.renterInfo.firstName?.toLowerCase().includes(searchLower) ||
          booking.renterInfo.lastName?.toLowerCase().includes(searchLower))
      const supplierMatch = booking.supplierInfo?.some(
        (supplier) =>
          supplier.firstName?.toLowerCase().includes(searchLower) ||
          supplier.lastName?.toLowerCase().includes(searchLower)
      )
      const equipmentMatch = booking.equipmentInfo?.some(
        (equipment) =>
          equipment.name?.toLowerCase().includes(searchLower) ||
          equipment.category?.toLowerCase().includes(searchLower)
      )
      return renterMatch || supplierMatch || equipmentMatch
    })
  }, [baseFiltered, searchValue])

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedBookings,
    goToPage,
    totalItems,
    itemsPerPage,
  } = usePagination({ data: filteredData, itemsPerPage: 10 })

  useEffect(() => {
    if (highlightRef && bookings.length > 0) {
      const index = filteredData.findIndex(b => b.referenceNumber === highlightRef)
      if (index !== -1) {
        const page = Math.floor(index / itemsPerPage) + 1
        goToPage(page)
        setHighlightId(filteredData[index]._id)
        setTimeout(() => setHighlightId(null), 3000)
      }
    }
  }, [highlightRef, bookings, filteredData, itemsPerPage, goToPage])

  const handleViewDetails = (booking: BookingWithDetails) => {
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
                <h1 className="text-2xl font-bold text-primary">
                  {tPages("bookings.title")}
                </h1>
              </div>
            </div>
            <HomeButton />
          </div>
        </div>

        {/* Filters */}
        {session?.user?.userType !== "renter" && bookings.length > 0 && (
          <TableFilters
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            searchPlaceholder={t("searchPlaceholder")}
            filters={[
              {
                key: "status",
                label: t("filters.status"),
                options: [
                  { value: "all", label: t("filters.allStatus") },
                  { value: "pending", label: t("status.pending") },
                  { value: "paid", label: t("status.paid") },
                  { value: "completed", label: t("status.completed") },
                  { value: "cancelled", label: t("status.cancelled") },
                ],
              },
              {
                key: "date",
                label: t("filters.time"),
                options: [
                  { value: "all", label: t("filters.allTime") },
                  { value: "today", label: t("filters.today") },
                  { value: "week", label: t("filters.last7Days") },
                  { value: "month", label: t("filters.last30Days") },
                ],
              },
            ]}
            filterValues={filterValues}
            onFilterChange={handleFilterChange}
          />
        )}

        <div className="lg:bg-white lg:rounded-lg lg:shadow-sm lg:border lg:border-gray-200 overflow-hidden">
          {session?.user?.userType === "renter" ? (
            <RenterBookingView />
          ) : loading ? (
            <div className="p-12 text-center">
              <div className="animate-pulse text-gray-600 font-medium">
                {tEquipment("loading")}
              </div>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="text-red-500 text-lg mb-4">{t("error")}</div>
              <button
                onClick={fetchBookings}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                {t("retry")}
              </button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-medium">
              {t("noBookings")}
            </div>
          ) : filteredData.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-medium">
              {t(
                `no${filterValues.status
                  .charAt(0)
                  .toUpperCase()}${filterValues.status.slice(1)}Bookings`
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <tr>
                      <TableHead>{t("table.reference")}</TableHead>
                      <TableHead>{t("table.renter")}</TableHead>
                      <TableHead>{t("table.equipment")}</TableHead>
                      <TableHead>{t("table.usage")}</TableHead>
                      <TableHead>{t("table.total")}</TableHead>
                      <TableHead>{t("table.commission")}</TableHead>
                      <TableHead>{t("table.supplier")}</TableHead>
                      <TableHead align="center">{t("table.status")}</TableHead>
                      <TableHead align="center">{t("table.date")}</TableHead>
                      <TableHead align="center">{t("table.actions")}</TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {paginatedBookings.map((booking) => (
                      <BookingTableRow
                        key={booking._id}
                        booking={booking}
                        onViewDetails={handleViewDetails}
                        t={t}
                        highlight={highlightId === booking._id}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4">
                {paginatedBookings.map((booking) => (
                  <BookingMobileCard
                    key={booking._id}
                    booking={booking}
                    onViewDetails={handleViewDetails}
                    t={t}
                    highlight={highlightId === booking._id}
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
