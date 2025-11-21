import { MessageSquare } from 'lucide-react'

interface RenterMessageProps {
  message: string
  title: string
}

export default function RenterMessage({ message, title }: RenterMessageProps) {
  return (
    <div className="mt-6 bg-yellow-50 rounded-lg p-4">
      <h3 className="font-semibold mb-2 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-yellow-600" />
        {title}
      </h3>
      <p className="text-sm text-gray-700">{message}</p>
    </div>
  )
}
