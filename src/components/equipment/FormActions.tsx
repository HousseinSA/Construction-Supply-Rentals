import { useTranslations } from "next-intl"
import { Link } from "@/src/i18n/navigation"
import Button from "../ui/Button"

interface FormActionsProps {
  isSubmitting: boolean
  isEdit?: boolean
}

export default function FormActions({ isSubmitting, isEdit }: FormActionsProps) {
  const t = useTranslations("dashboard.equipment")

  return (
    <div className="flex flex-col sm:flex-row justify-end gap-4">
      <Link href="/dashboard/equipment">
        <Button
          type="button"
          variant="secondary"
          className="w-full sm:w-auto"
        >
          {t("cancel")}
        </Button>
      </Link>
      <Button
        type="submit"
        variant="primary"
        className="w-full sm:w-auto"
        disabled={isSubmitting}
      >
        {isSubmitting ? (isEdit ? t("updatingEquipment") : t("creatingEquipment")) : (isEdit ? t("updateEquipment") : t("createEquipment"))}
      </Button>
    </div>
  )
}
