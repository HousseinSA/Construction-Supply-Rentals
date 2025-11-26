"use client"

import { useState, useRef, useEffect } from "react"
import { useTranslations } from "next-intl"
import { User, LogIn, LogOut, LayoutDashboard, ClipboardList } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { useSession, signOut } from "next-auth/react"
import { useLocale } from "next-intl"
import ConfirmModal from "./ConfirmModal"
import { showToast } from "@/src/lib/toast"

interface AuthButtonsProps {
  onActionClick?: () => void
}

export default function AuthButtons({ onActionClick }: AuthButtonsProps) {
  const t = useTranslations("common")
  const tToast = useTranslations("toast")
  const locale = useLocale()
  const { data: session } = useSession()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const isRTL = locale === "ar"

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    setShowLogoutModal(true)
    setShowDropdown(false)
  }

  const confirmLogout = () => {
    setIsLoggingOut(true)
    localStorage.clear()
    sessionStorage.clear()
    showToast.success(tToast("logoutSuccess"))
    signOut({ callbackUrl: `/${locale}` })
  }

  if (session?.user) {
    return (
      <>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-10 h-10 rounded-full text-primary border border-primary font-semibold flex items-center justify-center "
          >
            <User size={20} />
          </button>

          {showDropdown && (
            <div
              className={`absolute ${
                isRTL ? "left-0" : "right-0"
              } top-full mt-1 w-64 sm:w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50`}
            >
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {session.user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session.user.email}
                </p>
              </div>
              <div className="py-1">
                {session.user.role === "admin" || session.user.userType === "supplier" ? (
                  <Link
                    href="/dashboard"
                    onClick={() => {
                      setShowDropdown(false)
                      onActionClick?.()
                    }}
                    className={`flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                  >
                    <LayoutDashboard size={16} />
                    {t("dashboard")}
                  </Link>
                ) : (
                  <Link
                    href="/bookings"
                    onClick={() => {
                      setShowDropdown(false)
                      onActionClick?.()
                    }}
                    className={`flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                  >
                    <ClipboardList size={16} />
                    {t("myTransactions")}
                  </Link>
                )}
                  <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                  >
                    <LogOut size={16} />
                    {t("logout")}
                  </button>
              </div>
            </div>
          )}
        </div>

        <ConfirmModal
          isOpen={showLogoutModal}
          onClose={() => !isLoggingOut && setShowLogoutModal(false)}
          onConfirm={confirmLogout}
          title={t("logout")}
          message={t("logoutConfirm")}
          confirmText={t("logout")}
          cancelText={t("cancel") || "Cancel"}
          icon={<LogOut className="text-red-600" size={24} />}
          isLoading={isLoggingOut}
        />
      </>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2">
      <Link
        href="/auth/login"
        onClick={onActionClick}
        className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors border border-gray-200 rounded-lg hover:border-primary/30"
      >
        <LogIn size={16} />
        <span>{t("login")}</span>
      </Link>

      <Link
        href="/auth/register"
        onClick={onActionClick}
        className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
      >
        <User size={16} />
        <span>{t("signup")}</span>
      </Link>
    </div>
  )
}
