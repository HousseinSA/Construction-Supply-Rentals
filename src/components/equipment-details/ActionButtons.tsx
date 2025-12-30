import { useState } from "react"
import { Phone, ArrowLeft, ShoppingCart, Calendar, Clock } from "lucide-react"
import { useTranslations } from "next-intl"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import BookingModal from "@/src/components/booking/BookingModal"
import SaleModal from "@/src/components/booking/SaleModal"
import Toast from "@/src/components/ui/Toast"

interface ActionButtonsProps {
  isForSale: boolean
  equipment: any
  onBookingSuccess?: () => void
}

export default function ActionButtons({ isForSale, equipment, onBookingSuccess }: ActionButtonsProps) {
  const t = useTranslations("equipmentDetails")
  const { data: session } = useSession()
  const router = useRouter()
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showSaleModal, setShowSaleModal] = useState(false)
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null)

  const isOwnEquipment = session?.user?.id === equipment.supplierId
  const isAdmin = session?.user?.role === 'admin'
  const shouldHideButton = isOwnEquipment || isAdmin

  const handleActionClick = () => {
    if (!session) {
      const currentPath = window.location.pathname
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(currentPath)}`)
      return
    }
    
    if (equipment.userBookingStatus === 'pending') {
      setToast({ message: t('bookingPending'), type: 'error' })
      return
    }
    
    if (isForSale) {
      setShowSaleModal(true)
    } else {
      setShowBookingModal(true)
    }
  }
  
  const getButtonContent = () => {
    if (equipment.userBookingStatus === 'pending') {
      return {
        icon: <Clock className="w-4 h-4 sm:w-5 sm:h-5" />,
        text: t('waitingApproval'),
        className: 'bg-yellow-500 hover:bg-yellow-600'
      }
    }
    
    // Only show as unavailable if there's an active booking happening right now
    if (equipment.hasActiveBookings) {
      return {
        icon: <Clock className="w-4 h-4 sm:w-5 sm:h-5" />,
        text: t('currentlyUnavailable'),
        className: 'bg-gray-400 cursor-not-allowed'
      }
    }
    
    return {
      icon: isForSale ? <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" /> : <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />,
      text: isForSale ? t('sendSaleRequest') : t('sendBookingRequest'),
      className: 'bg-primary hover:bg-primary/90'
    }
  }
  
  const buttonContent = getButtonContent()

  return (
    <>
      <div className="space-y-3 mt-6">
        {!shouldHideButton && (
          <button 
            onClick={handleActionClick}
            disabled={equipment.hasActiveBookings || (equipment.userBookingStatus === 'pending')}
            className={`w-full ${buttonContent.className} text-white py-3 sm:py-3.5 px-4 rounded-xl transition-all duration-300 font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:hover:shadow-lg`}
          >
            {buttonContent.icon}
            {buttonContent.text}
          </button>
        )}
        <button
          onClick={() => window.history.back()}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 sm:py-3 px-4 rounded-xl transition-all duration-200 font-medium text-sm sm:text-base flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("goBack")}
        </button>
      </div>
      
      {isForSale ? (
        <SaleModal
          isOpen={showSaleModal}
          onClose={() => setShowSaleModal(false)}
          equipment={equipment}
          onSaleSuccess={onBookingSuccess}
          buyerId={session?.user?.id || ""}
        />
      ) : (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          equipment={equipment}
          onBookingSuccess={onBookingSuccess}
        />
      )}
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={!!toast}
          onClose={() => setToast(null)}
        />
      )}
    </>
  )
}
