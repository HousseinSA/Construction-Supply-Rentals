import { memo } from "react"
import { X } from "lucide-react"

interface ModalHeaderProps {
  title: string
  onClose: () => void
}

function ModalHeader({ title, onClose }: ModalHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}

export default memo(ModalHeader)
