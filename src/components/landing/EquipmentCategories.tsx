import { useTranslations } from "next-intl"
import Image from "next/image"

const equipmentCategories = [
  {
    id: "excavator",
    name: "Excavator",
    image: "https://images.pexels.com/photos/1078884/pexels-photo-1078884.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
    count: 45,
  },
  {
    id: "bulldozer",
    name: "Bulldozer",
    image: "https://images.pexels.com/photos/1078884/pexels-photo-1078884.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
    count: 32,
  },
  {
    id: "dump-truck",
    name: "Dump Truck",
    image: "https://images.pexels.com/photos/1078884/pexels-photo-1078884.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
    count: 28,
  },
  {
    id: "crane",
    name: "Mobile Crane",
    image: "https://images.pexels.com/photos/236705/pexels-photo-236705.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
    count: 15,
  },
  {
    id: "loader",
    name: "Wheel Loader",
    image: "https://images.pexels.com/photos/1078884/pexels-photo-1078884.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
    count: 38,
  },
  {
    id: "grader",
    name: "Motor Grader",
    image: "https://images.pexels.com/photos/236705/pexels-photo-236705.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
    count: 22,
  },
]

export default function EquipmentCategories() {
  const t = useTranslations("landing")

  return (
    <section id="equipment" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
          {t("categories.title")}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {equipmentCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100 hover:border-primary"
            >
              <div className="relative h-36 overflow-hidden rounded-t-xl">
                <Image
                  src={category.image}
                  alt={t(`categories.${category.id}`)}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-bold text-sm text-gray-900 mb-2 group-hover:text-primary transition-colors">
                  {t(`categories.${category.id}`)}
                </h3>
                <p className="text-xs text-primary font-semibold bg-gray-50 px-2 py-1 rounded-full inline-block">
                  {category.count} {t("categories.available")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
