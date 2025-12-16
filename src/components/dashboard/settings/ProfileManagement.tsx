"use client"

import { useTranslations } from "next-intl"
import ProfileSettings from "./ProfileSettings"

export default function ProfileManagement() {
  const t = useTranslations("dashboard")
  return (
    <ProfileSettings
      apiEndpoint="/api/settings"
      titleKey="settings.profileInfo.title"
      phoneLabel={t("settings.profileInfo.phone")}
      passwordLabel={t("settings.profileInfo.password")}
    />
  )
}
