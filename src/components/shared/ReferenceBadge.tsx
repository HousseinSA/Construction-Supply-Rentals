import ReferenceNumber from "@/src/components/ui/ReferenceNumber"

interface ReferenceBadgeProps {
  referenceNumber: string
  label: string
  createdAt?: string
}

export default function ReferenceBadge({ referenceNumber, label, createdAt }: ReferenceBadgeProps) {
  return (
    <div className="mb-4 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="text-xl font-bold text-gray-600">{label}</div>
        <ReferenceNumber referenceNumber={referenceNumber} size="lg" />
      </div>
      {createdAt && (
        <div className="mt-2 text-sm text-gray-600 border-t border-orange-200 pt-2">
          {createdAt}
        </div>
      )}
    </div>
  )
}
