"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useSession } from "next-auth/react"
import { ArrowLeft, Edit, Eye } from "lucide-react"
import { Link, useRouter } from "@/src/i18n/navigation"
import HomeButton from "../ui/HomeButton"
import { showToast } from "@/src/lib/toast"
import Dropdown from "../ui/Dropdown"

export default function ManageEquipmentClient() {
  const { data: session } = useSession()
  const t = useTranslations("dashboard.equipment")
  const tCommon = useTranslations("common")
  const router = useRouter()
  const [equipment, setEquipment] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchEquipment()
  }, [])

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/equipment?admin=true")
      const data = await response.json()
      
      if (data.success) {
        const usersResponse = await fetch("/api/users")
        const usersData = await usersResponse.json()
        
        const equipmentWithSuppliers = data.data.map((item: any) => {
          if (item.supplierId && usersData.success) {
            const supplierId = typeof item.supplierId === 'object' ? item.supplierId.$oid || item.supplierId.toString() : item.supplierId
            const supplier = usersData.data.find(
              (user: any) => user._id === supplierId || user._id.toString() === supplierId
            )
            if (supplier) {
              return { ...item, supplier }
            }
          }
          return item
        })
        setEquipment(equipmentWithSuppliers)
      }
    } catch (error) {
      console.error("Error fetching equipment:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdating(id)
    try {
      const response = await fetch(`/api/equipment/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      if (response.ok) {
        setEquipment(prev => prev.map(item => 
          item._id === id ? { ...item, status: newStatus } : item
        ))
        showToast.success(t(newStatus === "approved" ? "equipmentApproved" : "equipmentRejected"))
      }
    } catch (error) {
      showToast.error(t("equipmentUpdateFailed"))
    } finally {
      setUpdating(null)
    }
  }

  const handleAvailabilityChange = async (id: string, isAvailable: boolean) => {
    setUpdating(id)
    try {
      const response = await fetch(`/api/equipment/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable })
      })
      if (response.ok) {
        setEquipment(prev => prev.map(item => 
          item._id === id ? { ...item, isAvailable } : item
        ))
        showToast.success(t("availabilityUpdated"))
      }
    } catch (error) {
      showToast.error(t("equipmentUpdateFailed"))
    } finally {
      setUpdating(null)
    }
  }

  if (!session?.user || session.user.role !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Link href="/dashboard" className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t("manageTitle")}</h1>
                <p className="text-gray-600 text-sm">{t("manageSubtitle")}</p>
              </div>
            </div>
            <HomeButton />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-pulse text-gray-600 font-medium">{t("loading")}</div>
            </div>
          ) : equipment.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-medium">No equipment found</div>
          ) : (
            <>
            <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">{t("name")}</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">{t("location")}</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">{t("price")}</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">{t("supplierInfo")}</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">{t("createdAt")}</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">{t("status")}</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">{t("availability")}</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {equipment.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img src={item.images[0] || "/equipement-images/default-fallback-image.png"} alt={item.name} className="w-20 h-20 object-cover rounded-lg shadow-sm" />
                          <div>
                            <div className="font-semibold text-gray-900 text-base mb-1">{item.name}</div>
                            {item.createdBy === "admin" && <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">{t("createdByAdmin")}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-700">{item.location}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">
                          {item.listingType === "forSale" ? `${item.pricing.salePrice?.toLocaleString()} UM` : 
                           item.pricing.hourlyRate ? `${item.pricing.hourlyRate} UM/${tCommon("hour")}` :
                           item.pricing.dailyRate ? `${item.pricing.dailyRate} UM/${tCommon("day")}` :
                           item.pricing.kmRate ? `${item.pricing.kmRate} UM/${tCommon("km")}` : "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {item.supplier ? (
                          <div className="space-y-1">
                            <div className="font-bold text-gray-900 text-base">{item.supplier.firstName} {item.supplier.lastName}</div>
                            <div className="text-sm text-gray-700">{item.supplier.email}</div>
                            <div className="text-sm text-gray-700">{item.supplier.phone}</div>
                            {item.supplier.companyName && <div className="text-sm font-semibold text-gray-800 mt-1">{item.supplier.companyName}</div>}
                            {item.supplier.location && <div className="text-xs text-gray-600">{item.supplier.location}</div>}
                          </div>
                        ) : <span className="text-gray-400 text-sm">-</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-gray-600">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.status === "pending" ? (
                          <div className="flex flex-col gap-2">
                            <button onClick={() => handleStatusChange(item._id, "approved")} disabled={updating === item._id} className="px-3 py-1.5 text-xs font-medium bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 transition-colors">{t("approve")}</button>
                            <button onClick={() => handleStatusChange(item._id, "rejected")} disabled={updating === item._id} className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 transition-colors">{t("reject")}</button>
                          </div>
                        ) : (
                          <span className={`inline-block px-3 py-1.5 text-xs font-semibold rounded-md ${item.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{t(item.status)}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <div className="w-40">
                            <Dropdown
                              options={[
                                { value: "available", label: t("available") },
                                { value: "unavailable", label: t("unavailable") }
                              ]}
                              value={item.isAvailable ? "available" : "unavailable"}
                              onChange={(val) => handleAvailabilityChange(item._id, val === "available")}
                              disabled={updating === item._id}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {item.createdBy === "admin" && (
                            <button onClick={() => router.push(`/dashboard/equipment/edit/${item._id}`)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title={t("editEquipment")}>
                              <Edit className="w-5 h-5" />
                            </button>
                          )}
                          <button onClick={() => router.push(`/equipment/${item._id}`)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title={t("viewDetails")}>
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
            
            <div className="lg:hidden divide-y divide-gray-200">
              {equipment.map((item) => (
                <div key={item._id} className="p-4 hover:bg-gray-50">
                  <div className="flex gap-3 mb-3">
                    <img src={item.images[0] || "/equipement-images/default-fallback-image.png"} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                      {item.createdBy === "admin" && <span className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded mb-1">{t("createdByAdmin")}</span>}
                      <p className="text-sm text-gray-600">{item.location}</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {item.listingType === "forSale" ? `${item.pricing.salePrice?.toLocaleString()} UM` : 
                         item.pricing.hourlyRate ? `${item.pricing.hourlyRate} UM/${tCommon("hour")}` :
                         item.pricing.dailyRate ? `${item.pricing.dailyRate} UM/${tCommon("day")}` :
                         item.pricing.kmRate ? `${item.pricing.kmRate} UM/${tCommon("km")}` : "N/A"}
                      </p>
                    </div>
                  </div>
                  
                  {item.supplier && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm font-bold text-gray-800 mb-2">{t("supplierInfo")}</p>
                      <div className="space-y-1">
                        <p className="text-base font-semibold text-gray-900">{item.supplier.firstName} {item.supplier.lastName}</p>
                        <p className="text-sm text-gray-700">{item.supplier.email}</p>
                        <p className="text-sm text-gray-700">{item.supplier.phone}</p>
                        {item.supplier.companyName && <p className="text-sm font-medium text-gray-800">{item.supplier.companyName}</p>}
                        {item.supplier.location && <p className="text-sm text-gray-600">{item.supplier.location}</p>}
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-600 mb-2">{t("status")}:</p>
                    {item.status === "pending" ? (
                      <div className="flex gap-2">
                        <button onClick={() => handleStatusChange(item._id, "approved")} disabled={updating === item._id} className="px-3 py-1.5 text-xs font-medium bg-green-500 text-white rounded-md hover:bg-green-600 flex-1">{t("approve")}</button>
                        <button onClick={() => handleStatusChange(item._id, "rejected")} disabled={updating === item._id} className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-md hover:bg-red-600 flex-1">{t("reject")}</button>
                      </div>
                    ) : (
                      <span className={`inline-block px-3 py-1.5 text-xs font-semibold rounded-md ${item.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{t(item.status)}</span>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <Dropdown
                      options={[
                        { value: "available", label: t("available") },
                        { value: "unavailable", label: t("unavailable") }
                      ]}
                      value={item.isAvailable ? "available" : "unavailable"}
                      onChange={(val) => handleAvailabilityChange(item._id, val === "available")}
                      disabled={updating === item._id}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    {item.createdBy === "admin" && (
                      <button onClick={() => router.push(`/dashboard/equipment/edit/${item._id}`)} className="flex-1 p-2 text-blue-600 bg-blue-50 rounded-lg font-medium text-sm">
                        <Edit className="w-4 h-4 inline mr-1" /> {t("editEquipment")}
                      </button>
                    )}
                    <button onClick={() => router.push(`/equipment/${item._id}`)} className="flex-1 p-2 text-gray-600 bg-gray-100 rounded-lg font-medium text-sm">
                      <Eye className="w-4 h-4 inline mr-1" /> {t("viewDetails")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
