import { User, Phone, MessageCircle } from 'lucide-react'
import CopyButton from '@/src/components/ui/CopyButton'
import { formatPhoneNumber } from '@/src/lib/format'

interface RenterInfoProps {
  renter: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  labels: {
    title: string
    name: string
    email: string
    phone: string
    call: string
  }
}

export default function RenterInfo({ renter, labels }: RenterInfoProps) {
  return (
    <div className="bg-blue-50 rounded-lg p-4 h-[280px] flex flex-col">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <User className="w-5 h-5 text-blue-600" />
        {labels.title}
      </h3>
      <div className="space-y-2 text-sm flex-1">
        <div className="flex justify-between">
          <span className="text-gray-600">{labels.name}</span>
          <span className="font-medium">{renter.firstName} {renter.lastName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{labels.email}</span>
          <span className="font-medium">{renter.email}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">{labels.phone}</span>
          <div className="flex items-center gap-2">
            <span className="font-medium" dir="ltr">{formatPhoneNumber(renter.phone)}</span>
            <CopyButton text={renter.phone} size="sm" />
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex gap-2">
        <a
          href={`tel:${renter.phone}`}
          className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 text-sm flex-1 justify-center"
        >
          <Phone className="w-4 h-4" />
          {labels.call}
        </a>
        <a
          href={`https://wa.me/222${renter.phone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex-1 justify-center"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </a>
      </div>
    </div>
  )
}
