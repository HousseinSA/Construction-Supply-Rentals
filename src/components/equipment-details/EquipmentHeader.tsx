interface EquipmentHeaderProps {
  name: string
  description?: string
}

export default function EquipmentHeader({ name, description }: EquipmentHeaderProps) {
  return (
    <div className="mb-4 sm:mb-6">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
        {name}
      </h1>
      {description && (
        <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed">
          {description}
        </p>
      )}
    </div>
  )
}
