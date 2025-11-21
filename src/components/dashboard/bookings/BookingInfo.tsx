import { BookIcon  } from 'lucide-react'

interface BookingInfoProps {
  bookingId: string
  totalPrice: number
  commission: number
  createdAt: string
  labels: {
    title: string
    bookingId: string
    totalAmount: string
    commission: string
    createdAt: string
  }
}

export default function BookingInfo({ bookingId, totalPrice, commission, createdAt, labels }: BookingInfoProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 h-[200px] flex flex-col">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <BookIcon  className="w-5 h-5 text-primary" />
        {labels.title}
      </h3>
      <div className="space-y-2 text-sm flex-1">
        <div className="flex justify-between">
          <span className="text-gray-600">{labels.bookingId}</span>
          <span className="font-medium">{bookingId.slice(-6).toUpperCase().replace(/(.{3})(.{3})/, '$1-$2')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{labels.totalAmount}</span>
          <span className="font-medium" dir="ltr">{totalPrice.toLocaleString()} MRU</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{labels.commission}</span>
          <span className="font-medium text-green-600" dir="ltr">{commission.toLocaleString()} MRU</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{labels.createdAt}</span>
          <span className="font-medium">{new Date(createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )
}
