import { useTranslations } from "next-intl"

interface DescriptionFieldProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

export default function DescriptionField({
  value,
  onChange,
}: DescriptionFieldProps) {
  const t = useTranslations("dashboard.equipment")

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {t("description")}
      </label>
      <textarea
        name="description"
        value={value}
        onChange={onChange}
        rows={4}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all duration-200"
        placeholder={t("descriptionPlaceholder")}
      />
    </div>
  )
}
