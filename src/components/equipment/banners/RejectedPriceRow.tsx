interface RejectedPriceRowProps {
  rejectedValue: number
  currentValue?: number
  suffix: string
  reason?: string
}

export default function RejectedPriceRow({
  rejectedValue,
  currentValue,
  suffix,
  reason
}: RejectedPriceRowProps) {
  const formatPrice = (value: number) => `${value} MRU`
  
  return (
    <div className="text-sm">
      {typeof currentValue === "number" && (
        <>
          <span className="text-gray-700" dir="ltr">
            {formatPrice(currentValue)}{suffix}
          </span>
          <span className="text-red-600"> ✗ </span>
        </>
      )}
      <span className="text-red-600" dir="ltr">
        {formatPrice(rejectedValue)}{suffix}
      </span>
      {reason && reason.trim() && <span> - {reason}</span>}
    </div>
  )
}
