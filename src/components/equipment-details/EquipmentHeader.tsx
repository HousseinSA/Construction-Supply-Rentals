interface EquipmentHeaderProps {
  name: string
  description?: string
}

export default function EquipmentHeader({ name, description }: EquipmentHeaderProps) {
  return (
    <div>
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
        {name}
      </h1>
      {description && (
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          {description}
        </p>
      )}
    </div>
  )
}
