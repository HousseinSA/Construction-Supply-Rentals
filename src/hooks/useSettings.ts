import { useEffect, useCallback } from 'react'
import { useSettingsStore } from '@/src/stores/settingsStore'

const ALLOWED_ENDPOINTS = ['/api/settings', '/api/admin/settings'];

const validateEndpoint = (endpoint: string): boolean => {
  return ALLOWED_ENDPOINTS.includes(endpoint);
};

export function useSettings(apiEndpoint: string) {
  const { settings, loading, setSettings, setLoading, shouldRefetch, invalidateCache } = useSettingsStore()

  const fetchSettings = useCallback(async () => {
    if (!validateEndpoint(apiEndpoint)) {
      console.error('Invalid API endpoint');
      return;
    }
    try {
      setLoading(true)
      const response = await fetch(apiEndpoint)
      if (response.ok) {
        const data = await response.json()
        setSettings({
          phone: data.phone || data.adminPhone || '',
          password: data.password || data.adminPassword || ''
        })
      } else {
        console.error('Failed to fetch settings:', response.status);
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }, [apiEndpoint, setSettings, setLoading])

  const updateSettings = async (phone: string, password: string) => {
    if (!validateEndpoint(apiEndpoint)) {
      console.error('Invalid API endpoint');
      return false;
    }
    try {
      const response = await fetch(apiEndpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      })

      if (response.ok) {
        setSettings({ phone, password })
        return true
      }
      console.error('Failed to update settings:', response.status);
      return false
    } catch (error) {
      console.error('Error saving settings:', error)
      return false
    }
  }

  useEffect(() => {
    if (shouldRefetch()) {
      fetchSettings()
    }
  }, [fetchSettings, shouldRefetch])

  return {
    settings,
    loading,
    updateSettings,
    invalidateCache,
  }
}
