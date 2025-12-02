"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Link } from "@/src/i18n/navigation"
import AuthCard from "./AuthCard"
import Button from "../ui/Button"
import Input from "../ui/Input"
import { toast } from "sonner"

export default function ResetPasswordForm() {
  const t = useTranslations("auth.resetPassword")
  const locale = useLocale()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale }),
      })

      const data = await response.json()

      if (data.success) {
        setIsSubmitted(true)
      } else {
        toast.error(data.error || 'Failed to send reset email')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <AuthCard
        title={t("successTitle")}
        subtitle={t("successMessage")}
      >
        <div className="text-center">
          <Link
            href="/auth/login"
            className="text-primary hover:text-primary-dark font-medium"
          >
            {t("backToLogin")}
          </Link>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title={t("title")}
      subtitle={t("subtitle")}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label={t("emailPlaceholder")}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? t("sending") : t("sendResetLink")}
        </Button>

        <div className="text-center">
          <Link
            href="/auth/login"
            className="text-sm text-primary hover:text-primary-dark"
          >
            {t("backToLogin")}
          </Link>
        </div>
      </form>
    </AuthCard>
  )
}