"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Settings, Save, Globe, Shield, Loader2 } from "lucide-react"
import { showToast } from "@/src/lib/toast"
import Input from "@/src/components/ui/Input"
import PasswordInput from "@/src/components/ui/PasswordInput"

export default function SettingsManagement() {
  const t = useTranslations("dashboard")
  const [settings, setSettings] = useState({
    supportPhone: "+222 45 111111",
    supportEmail: "support@krilyengin.com",
    adminPhone: "+222 45 111111",
    adminPassword: "12345678"
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      } finally {
        setIsInitialLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
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
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="mr-3 text-gray-600">{t("equipment.loading")}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Contact Information Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold">{t("settings.contactInfo.title")}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label={t("settings.contactInfo.supportEmail")}
            type="email"
            value={settings.supportEmail}
            onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
            placeholder="support@krilyengin.com"
          />
          
          <Input
            label={t("settings.contactInfo.supportPhone")}
            type="text"
            value={settings.supportPhone}
            onChange={(e) => setSettings({...settings, supportPhone: e.target.value})}
            placeholder="+222 XX XXXXXX"
          />
        </div>
      </div>

      {/* Admin Information Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-semibold">{t("settings.adminInfo.title")}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label={t("settings.adminInfo.adminPhone")}
            type="text"
            value={settings.adminPhone}
            onChange={(e) => setSettings({...settings, adminPhone: e.target.value})}
            placeholder="+222 XX XXXXXX"
          />
          
          <PasswordInput
            label={t("settings.adminInfo.adminPassword")}
            value={settings.adminPassword}
            onChange={(e) => setSettings({...settings, adminPassword: e.target.value})}
            placeholder="••••••••"
          />
        </div>
      </div>

      {/* Save Button */}
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