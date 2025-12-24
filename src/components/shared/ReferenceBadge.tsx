interface ReferenceBadgeProps {
  referenceNumber: string
  label: string
}

export default function ReferenceBadge({ referenceNumber, label }: ReferenceBadgeProps) {
  return (
    <div className="mb-4 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between">
      <div className="text-xl font-bold text-gray-600">{label}</div>
      <div className="text-xl font-bold text-primary" dir="ltr">
        {referenceNumber?.slice(0, 3)}-{referenceNumber?.slice(3)}
      </div>
    </div>
  )
}
