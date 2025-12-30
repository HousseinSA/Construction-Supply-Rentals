"use client"

import { useState, useMemo, useEffect } from "react"
import { useTranslations } from "next-intl"
import { ArrowLeft } from "lucide-react"
import { Link } from "@/src/i18n/navigation"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { usePagination } from "@/src/hooks/usePagination"
import { useTableFilters } from "@/src/hooks/useTableFilters"
import { getDateFilterMatch } from "@/src/lib/table-utils"
import SalesTableRow from "./SalesTableRow"
import SalesMobileCard from "./SalesMobileCard"
import SalesDetailsModal from "./SalesDetailsModal"
import Pagination from "@/src/components/ui/Pagination"
import HomeButton from "@/src/components/ui/HomeButton"
import TableFilters from "@/src/components/ui/TableFilters"
import { Table, TableHeader, TableBody, TableHead } from "@/src/components/ui/Table"
import { toast } from "sonner"

export default function SalesTable() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const highlightRef = searchParams.get("highlight")
  const t = useTranslations("dashboard.sales")
  const tPages = useTranslations("dashboard.pages")
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSale, setSelectedSale] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [highlightId, setHighlightId] = useState<string | null>(null)

  const fetchSales = async () => {
    try {
      setLoading(true)
      let url = "/api/sales"
      if (session?.user?.userType === "supplier" && session?.user?.id) {
        url += `?supplierId=${session.user.id}`
      }
      const response = await fetch(url)
      const data = await response.json()
      if (data.success) {
        setSales(data.data)
      }
    } catch (error) {
      toast.error("Failed to fetch sales")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchSales()
    }
  }, [session?.user])

  const { searchValue, setSearchValue, filterValues, handleFilterChange, filteredData: baseFiltered } = 
    useTableFilters({
      data: sales,
      searchFields: [],
      filterFunctions: {
        status: (sale, value) => value === "all" ? true : sale.status === value,
        date: (sale, value) => getDateFilterMatch(sale.createdAt, value),
      },
      defaultFilters: { status: "all", date: "all" },
    })

  const filteredData = useMemo(() => {
    if (!searchValue.trim()) return baseFiltered
    const searchLower = searchValue.toLowerCase()
    return baseFiltered.filter((sale) => {
      const buyerMatch = sale.buyerInfo && 
        (sale.buyerInfo[0]?.firstName?.toLowerCase().includes(searchLower) ||
         sale.buyerInfo[0]?.lastName?.toLowerCase().includes(searchLower))
      const equipmentMatch = sale.equipmentName?.toLowerCase().includes(searchLower)
      return buyerMatch || equipmentMatch
    })
  }, [baseFiltered, searchValue])

  const { currentPage, totalPages, paginatedData, goToPage, totalItems, itemsPerPage } = 
    usePagination({ data: filteredData, itemsPerPage: 10 })

  useEffect(() => {
    if (highlightRef && sales.length > 0) {
      const index = filteredData.findIndex(s => s.referenceNumber === highlightRef)
      if (index !== -1) {
        const page = Math.floor(index / itemsPerPage) + 1
        goToPage(page)
        setHighlightId(filteredData[index]._id)
        setTimeout(() => setHighlightId(null), 3000)
      }
    }
  }, [highlightRef, sales, filteredData, itemsPerPage, goToPage])

  const handleViewDetails = (sale: any) => {
    setSelectedSale(sale)
    setShowDetailsModal(true)
  }

  return (
    <div className=" min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Link href="/dashboard" className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-primary">{tPages("sales.title")}</h1>
              </div>
            </div>
            <HomeButton />
          </div>
        </div>
        {sales.length > 0 && (
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
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-pulse text-gray-600 font-medium">{t("loading")}</div>
            </div>
          ) : (
            <>
              <div className="hidden xl:block">
                <Table>
                  <TableHeader>
                    <tr>
                      <TableHead>{t("table.equipment")}</TableHead>
                      <TableHead>{t("table.buyer")}</TableHead>
                      <TableHead>{t("table.price")}</TableHead>
                      <TableHead>{t("table.commission")}</TableHead>
                      <TableHead>{t("table.supplier")}</TableHead>
                      <TableHead align="center">{t("table.status")}</TableHead>
                      <TableHead align="center">{t("table.date")}</TableHead>
                      <TableHead align="center">{t("table.actions")}</TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {sales.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-gray-500 font-medium">
                          {t("noSales")}
                        </td>
                      </tr>
                    ) : filteredData.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-gray-500 font-medium">
                          {filterValues.status === "all" ? t("noResults") : t(`no${filterValues.status.charAt(0).toUpperCase()}${filterValues.status.slice(1)}Sales`)}
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((sale) => (
                        <SalesTableRow key={sale._id} sale={sale} onViewDetails={handleViewDetails} t={t} highlight={highlightId === sale._id} />
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="xl:hidden space-y-4 p-4">
                {sales.length === 0 ? (
                  <div className="p-12 text-center text-gray-500 font-medium">{t("noSales")}</div>
                ) : filteredData.length === 0 ? (
                  <div className="p-12 text-center text-gray-500 font-medium">{filterValues.status === "all" ? t("noResults") : t(`no${filterValues.status.charAt(0).toUpperCase()}${filterValues.status.slice(1)}Sales`)}</div>
                ) : (
                  paginatedData.map((sale) => (
                    <SalesMobileCard key={sale._id} sale={sale} onViewDetails={handleViewDetails} t={t} highlight={highlightId === sale._id} />
                  ))
                )}
              </div>
              <div className="lg:hidden space-y-4 p-4">
                {sales.length === 0 ? (
                  <div className="p-12 text-center text-gray-500 font-medium">{t("noSales")}</div>
                ) : filteredData.length === 0 ? (
                  <div className="p-12 text-center text-gray-500 font-medium">{filterValues.status === "all" ? t("noResults") : t(`no${filterValues.status.charAt(0).toUpperCase()}${filterValues.status.slice(1)}Sales`)}</div>
                ) : (
                  paginatedData.map((sale) => (
                    <SalesMobileCard key={sale._id} sale={sale} onViewDetails={handleViewDetails} t={t} highlight={highlightId === sale._id} />
                  ))
                )}
              </div>
              {sales.length > 0 && filteredData.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={totalItems}
                  showInfo={true}
                />
              )}
            </>
          )}
        </div>

        {selectedSale && (
          <SalesDetailsModal
            sale={selectedSale}
            isOpen={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false)
              setSelectedSale(null)
            }}
            onStatusUpdate={fetchSales}
          />
        )}
      </div>
    </div>
  )
}
