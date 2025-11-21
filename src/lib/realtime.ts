// Centralized real-time update system
export type UpdateType = 'booking' | 'equipment' | 'user'

class RealtimeManager {
  private listeners = new Map<UpdateType, Set<() => void>>()
  private pollingInterval: NodeJS.Timeout | null = null
  private lastCheck = new Map<UpdateType, number>()

  subscribe(type: UpdateType, callback: () => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)!.add(callback)

    if (!this.pollingInterval) {
      this.startPolling()
    }

    return () => {
      this.listeners.get(type)?.delete(callback)
      if (this.listeners.get(type)?.size === 0) {
        this.listeners.delete(type)
      }
      if (this.listeners.size === 0) {
        this.stopPolling()
      }
    }
  }

  private startPolling() {
    this.pollingInterval = setInterval(() => {
      this.listeners.forEach((_, type) => {
        this.poll(type)
      })
    }, 3000) // Poll every 3 seconds
  }

  private async poll(type: UpdateType) {
    const lastTime = this.lastCheck.get(type) || Date.now()
    try {
      const res = await fetch(`/api/realtime/poll?type=${type}&since=${lastTime}`)
      if (res.ok) {
        const { hasUpdates } = await res.json()
        if (hasUpdates) {
          this.lastCheck.set(type, Date.now())
          this.listeners.get(type)?.forEach(callback => callback())
        }
      }
    } catch (error) {
      console.error(`Polling error for ${type}:`, error)
    }
  }

  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
  }
}

export const realtimeManager = new RealtimeManager()
