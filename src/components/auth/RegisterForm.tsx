"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Link, useRouter } from "@/src/i18n/navigation"
import AuthCard from "./AuthCard"
import RoleSelector from "./RoleSelector"
import Input from "../ui/Input"
import PasswordInput from "../ui/PasswordInput"
import Button from "../ui/Button"
import { showToast } from "@/src/lib/toast"
import { validateEmail, validateMauritanianPhone } from "@/src/lib/validators"
import CommissionStructure from "../ui/CommissionStructure"

type UserRole = "renter" | "supplier"

export default function RegisterForm() {
  const t = useTranslations("auth")
  const tToast = useTranslations("toast")
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<UserRole>("renter")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    companyName: "",
    location: "",
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === "phone") {
      const digits = value.replace(/\D/g, '')
      if (digits.length <= 8) {
        setFormData({ ...formData, phone: digits })
      }
      return
    }
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.firstName || !formData.lastName) {
      showToast.error(tToast("nameRequired"))
      return
    }
    
    if (!validateEmail(formData.email)) {
      showToast.error(tToast("invalidEmail"))
      return
    }
    
    if (!validateMauritanianPhone(formData.phone)) {
      showToast.error(tToast("invalidPhone"))
      return
    }
    
    if (!formData.password || formData.password.length < 6) {
      showToast.error(tToast("passwordRequired"))
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      showToast.error(tToast("passwordsNotMatch"))
      return
    }
    
    if (selectedRole === "supplier" && (!formData.companyName || !formData.location)) {
      showToast.error(tToast("supplierFieldsRequired"))
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          userType: selectedRole,
          ...(selectedRole === "supplier" && {
            companyName: formData.companyName,
            location: formData.location,
          }),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorKey = data.error
        if (errorKey === "emailAlreadyExists" || errorKey === "phoneAlreadyExists") {
          showToast.error(tToast(errorKey))
        } else {
          showToast.error(data.error || tToast("registerFailed"))
        }
        return
      }

      showToast.success(tToast("registerSuccess"))
      setTimeout(() => router.push("/auth/login"), 1500)
      
    } catch (error) {
      showToast.error(tToast("registerFailed"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthCard>
      <RoleSelector selectedRole={selectedRole} onRoleChange={setSelectedRole} />
      
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label={t("register.firstName")}
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
          
          <Input
            label={t("register.lastName")}
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
          />
          
          <Input
            label={t("register.email")}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          
          <Input
            label={t("register.phone")}
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
          
          <PasswordInput
            label={t("register.password")}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
          
          <PasswordInput
            label={t("register.confirmPassword")}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
          />

          {selectedRole === "supplier" && (
            <>
              <Input
                label={t("register.supplier.companyName")}
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="md:col-span-2"
                required
              />
              
              <Input
                label={t("register.supplier.location")}
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="md:col-span-2"
                required
              />
              
              {/* Commission Structure for Suppliers */}
              <div className="md:col-span-2">
                <CommissionStructure 
                  variant="compact" 
                  translationNamespace="auth.commission"
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-8">
          <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
            {isLoading ? t("register.creating") : t("register.createAccount")}
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {t("register.alreadyHaveAccount")}{" "}
            <Link href="/auth/login" className="text-primary hover:text-primary-dark font-medium">
              {t("register.loginLink")}
            </Link>
          </p>
        </div>
      </form>
    </AuthCard>
  )
}
