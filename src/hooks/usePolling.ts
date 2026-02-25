import { useEffect, useRef } from 'react'

interface UsePollingOptions {
  interval?: number
  enabled?: boolean
  maxInterval?: number
}

export function usePolling(
  callback: () => void | Promise<void>,
  options: UsePollingOptions = {}
) {
  const { interval = 30000, enabled = true, maxInterval = 240000 } = options
  const callbackRef = useRef(callback)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const currentIntervalRef = useRef(interval)
  const errorCountRef = useRef(0)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) return

    const poll = async () => {
      try {
        const result = callbackRef.current()
        if (result instanceof Promise) {
          await result
        }
        errorCountRef.current = 0
        currentIntervalRef.current = interval
      } catch (error) {
        console.error('Polling error:', error)
        errorCountRef.current++
        const backoff = Math.min(
          interval * Math.pow(2, errorCountRef.current),
          maxInterval
        )
        currentIntervalRef.current = backoff
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = setInterval(poll, backoff)
        }
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
          intervalRef.current = setInterval(poll, currentIntervalRef.current)
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
