"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Save, Shield, Loader2 } from "lucide-react"
import { showToast } from "@/src/lib/toast"
import Input from "@/src/components/ui/Input"
import PasswordInput from "@/src/components/ui/PasswordInput"

interface ProfileSettingsProps {
  apiEndpoint: string
  titleKey: string
  phoneLabel: string
  passwordLabel: string
}

export default function ProfileSettings({ 
  apiEndpoint, 
  titleKey, 
  phoneLabel, 
  passwordLabel 
}: ProfileSettingsProps) {
  const t = useTranslations("dashboard")
  const [settings, setSettings] = useState({
    phone: "",
    password: ""
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch(apiEndpoint)
        if (response.ok) {
          const data = await response.json()
          setSettings({
            phone: data.phone || data.adminPhone || '',
            password: data.password || data.adminPassword || ''
          })
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      } finally {
        setIsInitialLoading(false)
      }
    }

    loadSettings()
  }, [apiEndpoint])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const body = { phone: settings.phone, password: settings.password }

      const response = await fetch(apiEndpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        showToast.success('تم حفظ الإعدادات بنجاح!')
      } else {
        const error = await response.json()
        showToast.error(error.message || 'فشل في حفظ الإعدادات')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      showToast.error('حدث خطأ أثناء حفظ الإعدادات')
    } finally {
      setIsLoading(false)
    }
  }

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="mr-3 text-gray-600">{t("equipment.loading")}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-semibold">{t(titleKey)}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6"  >
          <Input
            label={phoneLabel}
            type="text"
            value={settings.phone}
            onChange={(e) => setSettings({...settings, phone: e.target.value})}
            placeholder="+222 XX XXXXXX"
          />
          <PasswordInput
            label={passwordLabel}
            value={settings.password}
            onChange={(e) => setSettings({...settings, password: e.target.value})}
            placeholder="••••••••"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isLoading ? t("equipment.loading") : t("settings.saveSettings")}
        </button>
      </div>
    </div>
  )
}