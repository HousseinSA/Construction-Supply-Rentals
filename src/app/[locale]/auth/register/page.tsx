// import { setRequestLocale } from "next-intl/server"
import RegisterForm from "@/src/components/auth/RegisterForm"

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  // setRequestLocale(locale)

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <RegisterForm />
      </div>
    </div>
  )
}