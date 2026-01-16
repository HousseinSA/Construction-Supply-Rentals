"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Save, Shield, Loader2 } from "lucide-react"
import { showToast } from "@/src/lib/toast"
import { useSettings } from "@/src/hooks/useSettings"
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
  const { settings, loading: isInitialLoading, updateSettings } = useSettings(apiEndpoint)
  const [localSettings, setLocalSettings] = useState({ phone: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings)
    }
  }, [settings])

  const handleSave = async () => {
    setIsLoading(true)
    const success = await updateSettings(localSettings.phone, localSettings.password)
    if (success) {
      showToast.success('تم حفظ الإعدادات بنجاح!')
    } else {
      showToast.error('فشل في حفظ الإعدادات')
    }
    setIsLoading(false)
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
            value={localSettings.phone}
            onChange={(e) => setLocalSettings({...localSettings, phone: e.target.value})}
            placeholder="+222 XX XXXXXX"
          />
          <PasswordInput
            label={passwordLabel}
            value={localSettings.password}
            onChange={(e) => setLocalSettings({...localSettings, password: e.target.value})}
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