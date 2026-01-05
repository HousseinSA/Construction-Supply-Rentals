interface ModalDateSectionProps {
  items: Array<{ label: string; value: string }>
  gridCols?: number
}

export default function ModalDateSection({ items, gridCols = 1 }: ModalDateSectionProps) {
  return (
    <div className="bg-gray-50 py-4 border-b border-gray-200 -mx-6 px-6">
      <div className={`grid grid-cols-${gridCols} gap-6`}>
        {items.map((item, index) => (
          <div key={index}>
            <div className="text-xs font-medium text-gray-600 mb-2">{item.label}</div>
            <div className="text-sm font-semibold text-gray-900">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}