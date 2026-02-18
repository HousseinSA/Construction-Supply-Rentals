import { useEffect, useRef } from 'react'

interface UsePollingOptions {
  interval?: number
  enabled?: boolean
}

export function usePolling(
  callback: () => void | Promise<void>,
  options: UsePollingOptions = {}
) {
  const { interval = 30000, enabled = true } = options
  const callbackRef = useRef(callback)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) return

    const poll = () => {
      try {
        const result = callbackRef.current()
        if (result instanceof Promise) {
          result.catch((error) => console.error('Polling error:', error))
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      } else {
        if (!intervalRef.current) {
          intervalRef.current = setInterval(poll, interval)
        }
      }
    }

    intervalRef.current = setInterval(poll, interval)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [interval, enabled])
}
