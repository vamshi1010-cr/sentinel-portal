/**
 * WebSocket + REST API service for Sentinel Portal telemetry.
 * Connects to the local FastAPI backend only.
 * No external network connections are made.
 */

import type { TelemetrySnapshot, ScenarioInfo, ComparisonData } from '../types'

const BASE = ''  // proxied via Vite to localhost:8000

export async function fetchScenarios(): Promise<ScenarioInfo[]> {
  const res = await fetch(`${BASE}/api/scenarios`)
  if (!res.ok) throw new Error('Failed to fetch scenarios')
  return res.json()
}

export async function fetchComparison(): Promise<ComparisonData> {
  const res = await fetch(`${BASE}/api/comparison`)
  if (!res.ok) throw new Error('Failed to fetch comparison')
  return res.json()
}

export async function controlRestart(scenarioId?: string): Promise<void> {
  const url = scenarioId
    ? `${BASE}/api/control/restart?scenario_id=${scenarioId}`
    : `${BASE}/api/control/restart`
  await fetch(url, { method: 'POST' })
}

export async function controlPause(): Promise<void> {
  await fetch(`${BASE}/api/control/pause`, { method: 'POST' })
}

export async function controlResume(): Promise<void> {
  await fetch(`${BASE}/api/control/resume`, { method: 'POST' })
}

export async function controlSpeed(multiplier: number): Promise<void> {
  await fetch(`${BASE}/api/control/speed?multiplier=${multiplier}`, { method: 'POST' })
}

export async function controlScenario(scenarioId: string): Promise<void> {
  await fetch(`${BASE}/api/control/scenario?scenario_id=${scenarioId}`, { method: 'POST' })
}

type SnapshotCallback = (snap: TelemetrySnapshot) => void
type StatusCallback = (status: 'connected' | 'disconnected' | 'error') => void

export function createTelemetrySocket(
  onSnapshot: SnapshotCallback,
  onStatus: StatusCallback
): () => void {
  let ws: WebSocket | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let destroyed = false

  function connect() {
    if (destroyed) return
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const host = window.location.host
    ws = new WebSocket(`${protocol}://${host}/ws/telemetry`)

    ws.onopen = () => onStatus('connected')

    ws.onmessage = (ev) => {
      try {
        const snap = JSON.parse(ev.data) as TelemetrySnapshot
        onSnapshot(snap)
      } catch {
        // malformed message — ignore
      }
    }

    ws.onerror = () => onStatus('error')

    ws.onclose = () => {
      onStatus('disconnected')
      if (!destroyed) {
        reconnectTimer = setTimeout(connect, 2000)
      }
    }
  }

  connect()

  return () => {
    destroyed = true
    if (reconnectTimer) clearTimeout(reconnectTimer)
    ws?.close()
  }
}
