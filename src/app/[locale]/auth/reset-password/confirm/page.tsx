"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import AuthCard from "@/src/components/auth/AuthCard"
import Button from "@/src/components/ui/Button"
import PasswordInput from "@/src/components/ui/PasswordInput"
import { Link } from "@/src/i18n/navigation"

export default function ConfirmResetPage() {
  const t = useTranslations("auth.resetPassword")
  const searchParams = useSearchParams()
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    setToken(searchParams.get("token"))
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error(t("passwordsDontMatch"))
      return
    }

    if (password.length < 6) {
      toast.error(t("passwordTooShort"))
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/password-reset", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(t("resetSuccess"))
        router.push("/auth/login")
      } else {
        toast.error(data.error || t("resetFailed"))
      }
    } catch (error) {
      toast.error(t("somethingWentWrong"))
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          <AuthCard title={t("invalidLinkTitle")} subtitle={t("invalidLinkSubtitle")}>
            <Link href="/auth/reset-password" className="text-primary hover:text-primary-dark">
              {t("requestNewLink")}
            </Link>
          </AuthCard>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <AuthCard title={t("confirmTitle")} subtitle={t("confirmSubtitle")}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <PasswordInput
              label={t("newPassword")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <PasswordInput
              label={t("confirmNewPassword")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
              {isLoading ? t("resetting") : t("resetPasswordButton")}
            </Button>
          </form>
        </AuthCard>
      </div>
    </div>
  )
}
