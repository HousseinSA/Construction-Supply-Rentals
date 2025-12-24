interface MessageSectionProps {
  message: string
  title: string
  variant?: "buyer" | "renter"
}

export default function MessageSection({ message, title, variant = "renter" }: MessageSectionProps) {
  const colorMap = {
    buyer: "bg-blue-50 border-blue-100",
    renter: "bg-blue-50 border-blue-100",
  }

  return (
    <div className={`${colorMap[variant]} rounded-lg p-4 border`}>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
    </div>
  )
}
