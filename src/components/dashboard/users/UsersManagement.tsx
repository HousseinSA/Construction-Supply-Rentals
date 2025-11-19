"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  ShieldOff,
  AlertTriangle,
} from "lucide-react"
import { User } from "@/src/lib/types"
import Dropdown from "@/src/components/ui/Dropdown"
import { usePagination } from "@/src/hooks/usePagination"
import Pagination from "@/src/components/ui/Pagination"
import ConfirmModal from "@/src/components/ui/ConfirmModal"
import { showToast } from "@/src/lib/toast"
import CopyButton from "@/src/components/ui/CopyButton"
import { formatPhoneNumber } from "@/src/lib/format"

export default function UsersManagement() {
  const t = useTranslations("dashboard")
  const tCommon = useTranslations("common")
  const locale = useLocale()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    userId: string | null
    action: "block" | "unblock" | null
    userName: string
  }>({ isOpen: false, userId: null, action: null, userName: "" })
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const result = await response.json()
        setUsers(result.data || [])
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    if (user.role === "admin") return false

    const matchesSearch =
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm)

    const matchesRole = filterRole === "all" || user.userType === filterRole

    return matchesSearch && matchesRole
  })

  // Also filter stats to exclude admins
  const nonAdminUsers = users.filter((user) => user.role !== "admin")

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedUsers,
    goToPage,
    totalItems,
    itemsPerPage,
  } = usePagination({ data: filteredUsers, itemsPerPage: 10 })

  const getRoleText = (user: User) => {
    if (user.role === "admin") return t("users.roles.admin")
    return user.userType === "supplier"
      ? t("users.roles.supplier")
      : t("users.roles.renter")
  }

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }



  const openConfirmModal = (
    userId: string,
    action: "block" | "unblock",
    userName: string
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

      const response = await fetch(`/api/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: confirmModal.userId,
          status: newStatus,
        }),
      })

      if (!response.ok) throw new Error("Failed to update user")

      // Update user status locally
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id?.toString() === confirmModal.userId
            ? { ...user, status: newStatus }
            : user
        )
      )

      showToast.success(
        t(
          `users.user${
            confirmModal.action === "block" ? "Blocked" : "Unblocked"
          }`
        )
      )
    } catch (error) {
      showToast.error("Failed to update user status")
    } finally {
      setUpdating(null)
      closeConfirmModal()
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-12 text-center">
          <div className="animate-pulse text-gray-600 font-medium">
            {t("equipment.loading")}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary - Moved to Top */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-3xl font-bold text-gray-900">
            {nonAdminUsers.length}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {t("users.totalUsers")}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-3xl font-bold text-green-600">
            {nonAdminUsers.filter((u) => u.userType === "supplier").length}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {t("users.suppliers")}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-3xl font-bold text-blue-600">
            {nonAdminUsers.filter((u) => u.userType === "renter").length}
          </div>
          <div className="text-sm text-gray-600 mt-1">{t("users.renters")}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder={t("users.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <Dropdown
            options={[
              { value: "all", label: t("users.allRoles") },
              { value: "supplier", label: t("users.roles.supplier") },
              { value: "renter", label: t("users.roles.renter") },
            ]}
            value={filterRole}
            onChange={setFilterRole}
            placeholder={t("users.allRoles")}
            compact
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-medium">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("users.noUsers")}
            </h3>
            <p className="text-gray-500">{t("users.noUsersDesc")}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("equipment.name")}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("equipment.email")}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("equipment.phone")}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("users.status")}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("equipment.createdAt")}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("users.actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              {user.userType === "supplier" &&
                                user.companyName && (
                                  <div className="text-sm text-gray-500">
                                    {user.companyName}
                                  </div>
                                )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="mr-2">{user.email}</span>
                            <CopyButton text={user.email} size="sm" />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Phone className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="mr-2" dir="ltr">{formatPhoneNumber(user.phone)}</span>
                            <CopyButton text={user.phone} size="sm" />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : user.userType === "supplier"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {getRoleText(user)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.status === "blocked"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {user.status === "blocked"
                              ? t("users.blocked")
                              : t("users.active")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            {formatDate(user.createdAt || new Date())}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() =>
                              openConfirmModal(
                                user._id?.toString() || "",
                                user.status === "blocked" ? "unblock" : "block",
                                `${user.firstName} ${user.lastName}`
                              )
                            }
                            disabled={updating === user._id?.toString()}
                            className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium disabled:opacity-50 ${
                              user.status === "blocked"
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-red-100 text-red-700 hover:bg-red-200"
                            }`}
                          >
                            {user.status === "blocked" ? (
                              <>
                                <Shield className="h-4 w-4 mr-1" />
                                {updating === user._id?.toString()
                                  ? "Processing..."
                                  : t("users.unblockUser")}
                              </>
                            ) : (
                              <>
                                <ShieldOff className="h-4 w-4 mr-1" />
                                {updating === user._id?.toString()
                                  ? "Processing..."
                                  : t("users.blockUser")}
                              </>
                            )}
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
              {paginatedUsers.map((user) => (
                <div key={user._id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </h3>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : user.userType === "supplier"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {getRoleText(user)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>{user.email}</span>
                      </div>
                      <CopyButton text={user.email} size="sm" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        <span dir="ltr">{formatPhoneNumber(user.phone)}</span>
                      </div>
                      <CopyButton text={user.phone} size="sm" />
                    </div>
                    {user.userType === "supplier" && user.companyName && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{user.companyName}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{formatDate(user.createdAt || new Date())}</span>
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.status === "blocked"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.status === "blocked"
                          ? t("users.blocked")
                          : t("users.active")}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      openConfirmModal(
                        user._id?.toString() || "",
                        user.status === "blocked" ? "unblock" : "block",
                        `${user.firstName} ${user.lastName}`
                      )
                    }
                    disabled={updating === user._id?.toString()}
                    className={`w-full p-2 rounded-lg font-medium text-sm flex items-center justify-center disabled:opacity-50 ${
                      user.status === "blocked"
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-red-100 text-red-700 hover:bg-red-200"
                    }`}
                  >
                    {user.status === "blocked" ? (
                      <>
                        <Shield className="w-4 h-4 mr-1" />
                        {updating === user._id?.toString()
                          ? "Processing..."
                          : t("users.unblockUser")}
                      </>
                    ) : (
                      <>
                        <ShieldOff className="w-4 h-4 mr-1" />
                        {updating === user._id?.toString()
                          ? "Processing..."
                          : t("users.blockUser")}
                      </>
                    )}
                  </button>
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

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmAction}
        title={t(
          `users.confirm${
            confirmModal.action === "block" ? "Block" : "Unblock"
          }Title`
        )}
        message={t(
          `users.confirm${
            confirmModal.action === "block" ? "Block" : "Unblock"
          }Message`
        )}
        confirmText={t(`users.${confirmModal.action}User`)}
        cancelText={tCommon("cancel")}
        icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
        iconBgColor="bg-red-100"
        isLoading={updating === confirmModal.userId}
      />
    </div>
  )
}
