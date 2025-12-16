"use client"

import { useTranslations } from "next-intl"
import ProfileSettings from "./ProfileSettings"

export default function SettingsManagement() {
  const t = useTranslations("dashboard")

  return (
    <ProfileSettings
      apiEndpoint="/api/settings"
      titleKey="settings.adminInfo.title"
      phoneLabel={t("settings.adminInfo.adminPhone")}
      passwordLabel={t("settings.adminInfo.adminPassword")}
    />
  )
}