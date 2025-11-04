"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/src/i18n/navigation"
import AuthCard from "./AuthCard"
import Input from "../ui/Input"
import PasswordInput from "../ui/PasswordInput"
import Button from "../ui/Button"
import { showToast } from "@/src/lib/toast"
import { validateEmail, validateMauritanianPhone } from "@/src/lib/validators"

export default function LoginForm() {
  const t = useTranslations("auth")
  const tToast = useTranslations("toast")
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  })


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.emailOrPhone) {
      showToast.error(tToast("emailOrPhoneRequired"))
      return
    }
    
    if (!formData.password) {
      showToast.error(tToast("passwordRequired"))
      return
    }
    
    const isEmail = formData.emailOrPhone.includes('@')
    if (isEmail && !validateEmail(formData.emailOrPhone)) {
      showToast.error(tToast("invalidEmail"))
      return
    }
    
    if (!isEmail && !validateMauritanianPhone(formData.emailOrPhone)) {
      showToast.error(tToast("invalidPhone"))
      return
    }
    
    showToast.success(tToast("loginSuccess"))
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
            <Link href="/auth/reset-password" className="text-sm text-primary hover:text-primary-dark">
              {t("login.forgotPassword")}
            </Link>
          </div>

          <Button type="submit" variant="primary" className="w-full">
            {t("login.loginButton")}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {t("login.noAccount")}{" "}
            <Link href="/auth/register" className="text-primary hover:text-primary-dark font-medium">
              {t("login.registerLink")}
            </Link>
          </p>
        </div>
    </AuthCard>
  )
}