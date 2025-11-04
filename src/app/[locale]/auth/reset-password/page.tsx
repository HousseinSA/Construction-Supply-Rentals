import { setRequestLocale } from "next-intl/server"
import ResetPasswordForm from "@/src/components/auth/ResetPasswordForm"

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <ResetPasswordForm />
      </div>
    </div>
  )
}