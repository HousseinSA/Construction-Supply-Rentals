"use client"
import { useState } from "react"
import { useTranslations } from "next-intl"
import { Users, AlertTriangle } from "lucide-react"
import { useUsers } from "@/src/hooks/useUsers"
import Pagination from "@/src/components/ui/Pagination"
import ConfirmModal from "@/src/components/ui/ConfirmModal"
import TableFilters from "@/src/components/ui/TableFilters"
import TableLoading from "@/src/components/ui/TableLoading"
import { showToast } from "@/src/lib/toast"
import UserStats from "./UserStats"
import UserTable from "./UserTable"
import UserMobileCard from "./UserMobileCard"
import ErrorState from "@/src/components/ui/ErrorState"

export default function UsersManagement() {
  const t = useTranslations("dashboard")
  const tCommon = useTranslations("common")
  const {
    users,
    loading,
    error,
    fetchUsers,
    updateUserStatus,
    searchValue,
    setSearchValue,
    filterValues,
    handleFilterChange,
    currentPage,
    totalPages,
    goToPage,
    totalItems,
    itemsPerPage,
    stats,
  } = useUsers()
  const filterOptions =   [
              { value: "all", label: t("users.allRoles") },
              { value: "supplier", label: t("users.roles.supplier") },
              { value: "renter", label: t("users.roles.renter") },
            ]

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    userId: string | null
    action: "block" | "unblock" | null
    userName: string
  }>({ isOpen: false, userId: null, action: null, userName: "" })
  const [updating, setUpdating] = useState<string | null>(null)

  const openConfirmModal = (
    userId: string,
    action: "block" | "unblock",
    userName: string,
  ) => {
    setConfirmModal({ isOpen: true, userId, action, userName })
  }

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, userId: null, action: null, userName: "" })
  }

  const handleConfirmAction = async () => {
    if (!confirmModal.userId || !confirmModal.action) return

    setUpdating(confirmModal.userId)
    try {
      const newStatus = confirmModal.action === "block" ? "blocked" : "approved"
      const success = await updateUserStatus(confirmModal.userId, newStatus)

      if (success) {
        showToast.success(
          t(
            `users.user${confirmModal.action === "block" ? "Blocked" : "Unblocked"}`,
          ),
        )
      } else {
        showToast.error("Failed to update user status")
      }
    } catch (error) {
      showToast.error("Failed to update user status")
    } finally {
      setUpdating(null)
      closeConfirmModal()
    }
  }

  return (
    <div className="space-y-6">
      <UserStats stats={stats} t={t} />

      <TableFilters
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder={t("users.searchPlaceholder")}
        filters={[
          {
            key: "role",
            label: t("users.allRoles"),
            options:filterOptions,
          },
        ]}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
      />
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {error ? (
          <ErrorState onRetry={fetchUsers} />
        ) : users.length === 0 && !loading ? (
          <div className="p-12 text-center text-gray-500 font-medium">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("users.noUsers")}
            </h3>
            <p className="text-gray-500">{t("users.noUsersDesc")}</p>
          </div>
        ) : loading ? (
          <TableLoading message={t("equipment.loading")} />
        ) : (
          <>
            <div className="hidden xl:block">
              <UserTable
                users={users}
                onAction={openConfirmModal}
                updating={updating}
                t={t}
              />
            </div>
            <div className="xl:hidden divide-y divide-gray-200 space-y-4 p-4">
              {users.map((user) => (
                <UserMobileCard
                  key={user._id?.toString()}
                  user={user}
                  onAction={openConfirmModal}
                  updating={updating}
                  t={t}
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

      {confirmModal.action && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={closeConfirmModal}
          onConfirm={handleConfirmAction}
          title={t(
            `users.confirm${confirmModal.action === "block" ? "Block" : "Unblock"}Title`,
          )}
          message={t(
            `users.confirm${confirmModal.action === "block" ? "Block" : "Unblock"}Message`,
          )}
          confirmText={t(`users.${confirmModal.action}User`)}
          cancelText={tCommon("cancel")}
          icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
          iconBgColor="bg-red-100"
          isLoading={updating === confirmModal.userId}
        />
      )}
    </div>
  )
}
