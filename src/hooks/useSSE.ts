import { useEffect, useRef } from 'react'
import { UpdateType } from '@/src/lib/sse-manager'

export function useSSE(type: UpdateType, onUpdate: () => void) {
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!eventSourceRef.current) {
      eventSourceRef.current = new EventSource('/api/realtime/stream')
    }

    const eventSource = eventSourceRef.current

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === type) {
          onUpdate()
        }
      } catch (error) {
        console.error('SSE message parse error:', error)
      }
    }

    eventSource.addEventListener('message', handleMessage)

    return () => {
      eventSource.removeEventListener('message', handleMessage)
    }
  }, [type, onUpdate])

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [])
}