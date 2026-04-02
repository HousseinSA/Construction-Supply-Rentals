import { useState, useEffect, useRef, useCallback } from 'react'
import type { SSEConnectionOptions } from './sse-types'

const MAX_RETRIES = 10
const MAX_BACKOFF_DELAY = 30000
const INITIAL_BACKOFF_DELAY = 1000

let sharedEventSource: EventSource | null = null
let sharedConnected = false
let sharedError: string | null = null
let sharedReconnectTimeout: NodeJS.Timeout | null = null
let sharedReconnectAttempts = 0
let sharedListeners: Map<string, Set<(data: any) => void>> = new Map()
let sharedRegisteredListeners: Map<string, (e: MessageEvent) => void> = new Map()
let subscriberCount = 0
let shouldStopReconnecting = false
let stateUpdateCallbacks: Set<() => void> = new Set()

function notifyStateChange() {
  stateUpdateCallbacks.forEach(callback => callback())
}

function registerSharedListeners(eventSource: EventSource) {
  sharedListeners.forEach((handlers, eventType) => {
    if (sharedRegisteredListeners.has(eventType)) return

    const listener = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data)
        handlers.forEach(handler => handler(data))
      } catch (err) {
        console.error('[SSE] Failed to parse data:', err)
      }
    }

    eventSource.addEventListener(eventType, listener)
    sharedRegisteredListeners.set(eventType, listener)
  })
}

async function checkAuthStatus(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD', credentials: 'include' })
    if (response.status === 401 || response.status === 403) {
      console.error('[SSE] Auth error detected:', response.status)
      return false
    }
    return true
  } catch (err) {
    return true
  }
}

function connectShared(url: string) {
  if (sharedEventSource || shouldStopReconnecting) return

  try {
    const eventSource = new EventSource(url)
    sharedEventSource = eventSource

    eventSource.onopen = () => {
      console.log('[SSE Shared] Connection opened')
      sharedConnected = true
      sharedError = null
      sharedReconnectAttempts = 0
      shouldStopReconnecting = false
      registerSharedListeners(eventSource)
      notifyStateChange()
    }

    eventSource.onerror = async () => {
      console.error('[SSE Shared] Connection error')
      sharedConnected = false
      eventSource.close()
      sharedEventSource = null
      sharedRegisteredListeners.clear()

      if (sharedReconnectAttempts >= MAX_RETRIES) {
        console.error('[SSE] Max retries reached. Stopping reconnection.')
        sharedError = 'Max retries reached. Please refresh the page.'
        shouldStopReconnecting = true
        notifyStateChange()
        return
      }

      const hasAuth = await checkAuthStatus(url)
      if (!hasAuth) {
        console.error('[SSE] Authentication failed. Stopping reconnection.')
        sharedError = 'Authentication failed. Please log in again.'
        shouldStopReconnecting = true
        notifyStateChange()
        return
      }

      const backoffDelay = Math.min(INITIAL_BACKOFF_DELAY * Math.pow(2, sharedReconnectAttempts), MAX_BACKOFF_DELAY)
      sharedReconnectAttempts++
      sharedError = `Connection lost. Reconnecting... (${sharedReconnectAttempts}/${MAX_RETRIES})`

      console.log(`[SSE] Reconnecting in ${backoffDelay / 1000}s (attempt ${sharedReconnectAttempts}/${MAX_RETRIES})`)
      notifyStateChange()

      sharedReconnectTimeout = setTimeout(() => {
        if (subscriberCount > 0 && !shouldStopReconnecting) {
          connectShared(url)
        }
      }, backoffDelay)
    }
  } catch (err) {
    console.error('[SSE Shared] Failed to connect:', err)
  }
}

function disconnectShared() {
  if (sharedReconnectTimeout) {
    clearTimeout(sharedReconnectTimeout)
    sharedReconnectTimeout = null
  }

  if (sharedEventSource) {
    sharedEventSource.close()
    sharedEventSource = null
    sharedRegisteredListeners.clear()
    sharedListeners.clear()
    sharedConnected = false
    sharedError = null
  }
  
  sharedReconnectAttempts = 0
  shouldStopReconnecting = false
  notifyStateChange()
}

export function useSSEConnection(url: string, options: SSEConnectionOptions = {}) {
  const { enabled = true, onConnect, onDisconnect, onError } = options
  const [connected, setConnected] = useState(sharedConnected)
  const [error, setError] = useState<string | null>(sharedError)
  const isSubscribed = useRef(false)

  useEffect(() => {
    const updateState = () => {
      setConnected(sharedConnected)
      setError(sharedError)
      if (sharedError) {
        onError?.(sharedError)
      }
    }

    stateUpdateCallbacks.add(updateState)

    return () => {
      stateUpdateCallbacks.delete(updateState)
    }
  }, [onError])

  useEffect(() => {
    if (!enabled || isSubscribed.current) return

    subscriberCount++
    isSubscribed.current = true

    if (subscriberCount === 1) {
      connectShared(url)
    } else {
      setConnected(sharedConnected)
      setError(sharedError)
    }

    return () => {
      if (isSubscribed.current) {
        subscriberCount--
        isSubscribed.current = false

        if (subscriberCount === 0) {
          disconnectShared()
          onDisconnect?.()
        }
      }
    }
  }, [enabled, url, onDisconnect])

  const addEventListener = useCallback((eventType: string, handler: (data: any) => void) => {
    if (!sharedListeners.has(eventType)) {
      sharedListeners.set(eventType, new Set())
    }
    
    const handlers = sharedListeners.get(eventType)!
    if (handlers.has(handler)) return
    
    handlers.add(handler)

    if (sharedEventSource?.readyState === EventSource.OPEN && !sharedRegisteredListeners.has(eventType)) {
      const listener = (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data)
          handlers.forEach(h => h(data))
        } catch (err) {
          console.error('[SSE] Failed to parse data:', err)
        }
      }
      sharedEventSource.addEventListener(eventType, listener)
      sharedRegisteredListeners.set(eventType, listener)
    }
  }, [])

  const removeEventListener = useCallback((eventType: string, handler: (data: any) => void) => {
    const handlers = sharedListeners.get(eventType)
    if (!handlers) return

    handlers.delete(handler)
    
    if (handlers.size === 0) {
      sharedListeners.delete(eventType)
      const listener = sharedRegisteredListeners.get(eventType)
      if (listener && sharedEventSource) {
        sharedEventSource.removeEventListener(eventType, listener)
        sharedRegisteredListeners.delete(eventType)
      }
    }
  }, [])

  const connect = useCallback(() => {
    if (!enabled || sharedEventSource) return
    connectShared(url)
  }, [url, enabled])

  const disconnect = useCallback(() => {
    disconnectShared()
  }, [])

  return {
    connected,
    error,
    connect,
    disconnect,
    addEventListener,
    removeEventListener,
  }
}
