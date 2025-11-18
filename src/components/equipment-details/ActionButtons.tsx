import { useState } from "react"
import { Phone, ArrowLeft, ShoppingCart, Calendar, Clock } from "lucide-react"
import { useTranslations } from "next-intl"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import BookingModal from "@/src/components/booking/BookingModal"
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
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null)

  const handleActionClick = () => {
    if (!session) {
      router.push('/auth/login')
      return
    }
    
    if (session.user.role === 'admin') {
      setToast({ message: 'Admins cannot make bookings', type: 'error' })
      return
    }
    
    if (equipment.userBookingStatus === 'pending') {
      setToast({ message: t('bookingPending'), type: 'error' })
      return
    }
    
    if (equipment.hasPendingBookings && equipment.userBookingStatus !== 'pending') {
      setToast({ message: t('equipmentUnavailable'), type: 'error' })
      return
    }
    
    setShowBookingModal(true)
  }
  
  const getButtonContent = () => {
    if (equipment.userBookingStatus === 'pending') {
      return {
        icon: <Clock className="w-4 h-4 sm:w-5 sm:h-5" />,
        text: t('waitingApproval'),
        className: 'bg-yellow-500 hover:bg-yellow-600'
      }
    }
    
    if (equipment.hasPendingBookings) {
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
      <div className="mt-auto pt-4 sm:pt-6 space-y-2 sm:space-y-3">
        <button 
          onClick={handleActionClick}
          disabled={equipment.hasPendingBookings && equipment.userBookingStatus !== 'pending'}
          className={`w-full ${buttonContent.className} text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-300 font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:hover:shadow-lg`}
        >
          {buttonContent.icon}
          {buttonContent.text}
        </button>
        <button
          onClick={() => window.history.back()}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-200 font-medium text-sm sm:text-base flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("goBack")}
        </button>
      </div>
      
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        equipment={equipment}
        onBookingSuccess={onBookingSuccess}
      />
      
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
