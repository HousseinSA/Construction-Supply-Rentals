"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/src/i18n/navigation"
import AuthCard from "./AuthCard"
import Button from "../ui/Button"
import Input from "../ui/Input"

export default function ResetPasswordForm() {
  const t = useTranslations("auth.resetPassword")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsLoading(false)
    setIsSubmitted(true)
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