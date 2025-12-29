"use client"

import { useEffect, useState, useRef } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Menu, X, ClipboardList, TagIcon, LayoutDashboard, Search } from "lucide-react"
import LanguageSwitcher from "@/components/ui/LanguageSwitcher"
import AuthButtons from "@/components/ui/AuthButtons"
import WhatsAppLink from "@/components/ui/WhatsAppLink"
import QuickSearchButton from "@/src/components/dashboard/shared/QuickSearchButton"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { type Session } from "next-auth"
import { useSession } from "next-auth/react"

interface HeaderProps {
  session: Session
}

export default function Header({ session: serverSession }: HeaderProps) {
  const { data: clientSession, status } = useSession()
  const session =
    status === "loading" ? serverSession : clientSession ?? serverSession
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [logoWidth, setLogoWidth] = useState(155)
  const locale = useLocale()
  const t = useTranslations("common")
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const isRenter = session?.user?.userType === "renter"
  const isSupplier = session?.user?.userType === "supplier"
  const isAdmin = session?.user?.role === "admin"
  const isAdminOrSupplier = isAdmin || isSupplier

  const getFontClass = () => {
    switch (locale) {
      case "ar":
        return "font-arabic"
      case "fr":
        return "font-french"
      default:
        return "font-english"
    }
  }

  useEffect(() => {
    const updateWidth = () => {
      if (window.innerWidth < 640) {
        setLogoWidth(120)
      } else if (window.innerWidth < 1024) {
        setLogoWidth(140)
      } else {
        setLogoWidth(155)
      }
    }

    updateWidth()
    window.addEventListener("resize", updateWidth)
    return () => window.removeEventListener("resize", updateWidth)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isMobileMenuOpen])

  return (
    <header
      className={`bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm ${getFontClass()}`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex mt-2 items-center gap-2">
            <Link
              href="/"
              className="flex items-center justify-center rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
            >
              <Image
                width={logoWidth}
                height={100}
                src={"/Kriliy-engin-logo.png"}
                alt="krilly engin logo"
                className="no-shimmer"
              />
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            {session?.user?.role === "admin" && (
              <QuickSearchButton />
            )}
            {isAdminOrSupplier && (
              <Link
                href="/dashboard"
                className="hidden lg:flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-sm font-medium">{t("dashboard")}</span>
              </Link>
            )}
            {isSupplier && (
              <Link
                href="/bookings"
                className="hidden lg:flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
              >
                <ClipboardList className="w-4 h-4" />
                <span className="text-sm font-medium">{t("myOrders")}</span>
              </Link>
            )}
            {isRenter && (
              <Link
                href="/bookings"
                className="hidden lg:flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
              >
                <ClipboardList className="w-4 h-4" />
                <span className="text-sm font-medium">{t("myBookings")}</span>
              </Link>
            )}
            <Link
              href="/equipment?listingType=forSale"
              className="hidden lg:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[var(--primary)] to-amber-500 text-white text-sm font-medium rounded-lg hover:from-[var(--primary-dark)] hover:to-amber-600 transition-all duration-300"
            >
              <TagIcon className="w-4 h-4" />
              <span className="text-sm font-medium">
                {t("equipmentForSale")}
              </span>
            </Link>
            <WhatsAppLink
              className={`hidden lg:flex text-gray-700 hover:text-green-600 [&>svg]:text-green-600 ${
                locale === "ar" ? "flex-row-reverse" : ""
              }`}
              phoneNumber="22245111111"
              displayText="222 45 11 11 11"
            />
            <div className="hidden lg:block">
              <AuthButtons session={session} />
            </div>
            <div className="hidden lg:block">
              <LanguageSwitcher
                onLanguageChange={() => setIsMobileMenuOpen(false)}
              />
            </div>

            {session?.user?.role === "admin" && (
              <button
                onClick={() => {
                  const searchButton = document.querySelector('[data-search-button]') as HTMLButtonElement
                  searchButton?.click()
                }}
                className="lg:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-700"
                title="Search"
              >
                <Search size={20} />
              </button>
            )}

            <div className="lg:hidden">
              <LanguageSwitcher
                onLanguageChange={() => setIsMobileMenuOpen(false)}
              />
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="lg:hidden border-t border-gray-200 py-3"
          >
            <nav className="px-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/equipment?listingType=forSale"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs bg-gradient-to-r from-[var(--primary)] to-amber-500 text-white rounded-lg hover:from-[var(--primary-dark)] hover:to-amber-600 transition-all duration-300 font-medium"
                >
                  <TagIcon className="w-3.5 h-3.5" />
                  <span>{t("equipmentForSale")}</span>
                </Link>
                <a
                  href="https://wa.me/22245111111"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors font-medium border border-green-200"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span>222 45 11 11 11</span>
                </a>
              </div>
              {isSupplier && (
                <Link
                  href="/bookings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                  <ClipboardList size={16} />
                  {t("myOrders")}
                </Link>
              )}
              <div className="pt-2 border-t border-gray-200">
                <AuthButtons
                  session={session}
                  onActionClick={() => setIsMobileMenuOpen(false)}
                  isMobile
                />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
