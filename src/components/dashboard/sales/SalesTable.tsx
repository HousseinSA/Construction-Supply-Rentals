'use client'
import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { ArrowLeft } from "lucide-react"
import { Link } from "@/src/i18n/navigation"
import { useSearchParams, useRouter } from "next/navigation"
import { useSales } from "@/src/hooks/useSales"
import { SaleWithDetails } from "@/src/stores/salesStore"
import SalesTableRow from "./SalesTableRow"
import SalesMobileCard from "./SalesMobileCard"
import SalesDetailsModal from "./SalesDetailsModal"
import Pagination from "@/src/components/ui/Pagination"
import HomeButton from "@/src/components/ui/HomeButton"
import TableFilters from "@/src/components/ui/TableFilters"
import { Table, TableHeader, TableBody, TableHead } from "@/src/components/ui/Table"

export default function SalesTable() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const highlightRef = searchParams.get("highlight")
  const t = useTranslations("dashboard.sales")
  const tPages = useTranslations("dashboard.pages")
  const { sales, loading, searchValue, setSearchValue, filterValues, handleFilterChange, currentPage, totalPages, goToPage, totalItems, itemsPerPage } = useSales()
  const [selectedSale, setSelectedSale] = useState<SaleWithDetails | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [hasProcessedHighlight, setHasProcessedHighlight] = useState(false)

  useEffect(() => {
    if (highlightRef && sales.length > 0 && !hasProcessedHighlight) {
      const index = sales.findIndex(s => s.referenceNumber === highlightRef)
      if (index !== -1) {
        const page = Math.floor(index / itemsPerPage) + 1
        goToPage(page)
        const foundSale = sales[index]
        const saleId = foundSale._id
        if (saleId) {
          setHighlightId(saleId)
          setSelectedSale(foundSale)
          setShowDetailsModal(true)
          setHasProcessedHighlight(true)
          setTimeout(() => setHighlightId(null), 3000)
          
          const newUrl = window.location.pathname
          router.replace(newUrl, { scroll: false })
        }
      }
    }
  }, [highlightRef, sales, itemsPerPage, goToPage, hasProcessedHighlight, router])

  const handleViewDetails = (sale: SaleWithDetails) => {
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
        <div className="xl:bg-white xl:rounded-lg xl:shadow-sm xl:border xl:border-gray-200 overflow-hidden">
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
                    ) : (
                      sales.map((sale) => (
                        <SalesTableRow key={sale._id} sale={sale} onViewDetails={handleViewDetails} t={t} highlight={highlightId === sale._id} />
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="xl:hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sales.length === 0 ? (
                  <div className="p-12 text-center text-gray-500 font-medium col-span-full">{t("noSales")}</div>
                ) : (
                  sales.map((sale) => (
                    <SalesMobileCard key={sale._id} sale={sale} onViewDetails={handleViewDetails} t={t} highlight={highlightId === sale._id} />
                  ))
                )}
              </div>
              {sales.length > 0 && (
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
            onStatusUpdate={() => {}}
          />
        )}
      </div>
    </div>
  )
}
