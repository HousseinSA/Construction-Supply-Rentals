"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Link, useRouter } from "@/src/i18n/navigation"
import { useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import AuthCard from "./AuthCard"
import Input from "../ui/Input"
import PasswordInput from "../ui/PasswordInput"
import Button from "../ui/Button"
import { showToast } from "@/src/lib/toast"
import { validateEmail, validateMauritanianPhone } from "@/src/lib/validators"

export default function LoginForm() {
  const t = useTranslations("auth")
  const tToast = useTranslations("toast")
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.emailOrPhone) {
      showToast.error(tToast("emailOrPhoneRequired"))
      return
    }

    if (!formData.password) {
      showToast.error(tToast("passwordRequired"))
      return
    }

    const isEmail = formData.emailOrPhone.includes("@")
    if (isEmail && !validateEmail(formData.emailOrPhone)) {
      showToast.error(tToast("invalidEmail"))
      return
    }

    if (!isEmail && !validateMauritanianPhone(formData.emailOrPhone)) {
      showToast.error(tToast("invalidPhone"))
      return
    }

    setLoading(true)
    try {
      const checkResponse = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "checkStatus",
          emailOrPhone: formData.emailOrPhone,
          password: formData.password,
        }),
      })

      const checkResult = await checkResponse.json()

      if (!checkResponse.ok) {
        if (checkResult.error === "ACCOUNT_BLOCKED") {
          showToast.error(tToast("accountBlockedError"))
        } else {
          showToast.error(tToast("loginFailed"))
        }
        setLoading(false)
        return
      }

      const result = await signIn("credentials", {
        emailOrPhone: formData.emailOrPhone,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        showToast.error(tToast("loginFailed"))
        setLoading(false)
        return
      }

      if (result?.ok) {
        showToast.success(tToast("loginSuccess"))
        
        const callbackUrl = searchParams.get("callbackUrl")
        const fromRegister = searchParams.get("from") === "register"
        
        if (checkResult.userType === "renter") {
          if (fromRegister) {
            router.replace("/")
          } else if (callbackUrl) {
            router.replace(callbackUrl)
          } else {
            router.replace("/")
          }
        } else {
          router.replace("/dashboard")
        }
      } else {
        showToast.error(tToast("loginFailed"))
        setLoading(false)
      }
    } catch (error) {
      showToast.error(tToast("loginFailed"))
      setLoading(false)
    }
  }

  return (
    <AuthCard title={t("login.title")}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label={t("login.emailOrPhone")}
          type="text"
          name="emailOrPhone"
          value={formData.emailOrPhone}
          onChange={handleInputChange}
          required
        />

        <PasswordInput
          label={t("login.password")}
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          required
        />

        <div className="text-right">
          <Link
            href="/auth/reset-password"
            className="text-sm text-primary hover:text-primary-dark"
          >
            {t("login.forgotPassword")}
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={loading}
        >
          {loading ? t("login.loggingIn") : t("login.loginButton")}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          {t("login.noAccount")}{" "}
          <Link
            href="/auth/register"
            className="text-primary hover:text-primary-dark font-medium"
          >
            {t("login.registerLink")}
          </Link>
        </p>
      </div>
    </AuthCard>
  )
}
