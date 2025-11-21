import { useEffect } from 'react'
import { realtimeManager, UpdateType } from '@/src/lib/realtime'

export function useRealtime(type: UpdateType, onUpdate: () => void) {
  useEffect(() => {
    const unsubscribe = realtimeManager.subscribe(type, onUpdate)
    return unsubscribe
  }, [type, onUpdate])
}
