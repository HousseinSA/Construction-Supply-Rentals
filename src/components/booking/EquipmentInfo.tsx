interface EquipmentInfoProps {
  name: string
  location: string
}

export default function EquipmentInfo({ name, location }: EquipmentInfoProps) {
  return (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-medium mb-2">{name}</h3>
      <p className="text-sm capitalize text-gray-600">{location}</p>
    </div>
  )
}
