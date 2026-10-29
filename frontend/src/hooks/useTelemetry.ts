/**
 * useTelemetry — custom hook that manages the WebSocket connection,
 * rolling history buffer, and derived state for the dashboard.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import type { TelemetrySnapshot, HistoryPoint, ScenarioInfo, ComparisonData } from '../types'
import {
  createTelemetrySocket,
  fetchScenarios,
  fetchComparison,
  controlPause,
  controlResume,
  controlRestart,
  controlSpeed,
  controlScenario,
} from '../services/api'

const MAX_HISTORY = 60  // keep ~48 seconds of history at 0.8 s interval

export function useTelemetry() {
  const [snap, setSnap] = useState<TelemetrySnapshot | null>(null)
  const [history, setHistory] = useState<HistoryPoint[]>([])
  const [wsStatus, setWsStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected')
  const [scenarios, setScenarios] = useState<ScenarioInfo[]>([])
  const [comparison, setComparison] = useState<ComparisonData | null>(null)
  const startTimeRef = useRef<number>(Date.now())
  const historyRef = useRef<HistoryPoint[]>([])

  // Fetch static data once
  useEffect(() => {
    fetchScenarios().then(setScenarios).catch(console.error)
    fetchComparison().then(setComparison).catch(console.error)
  }, [])

  // WebSocket connection
  useEffect(() => {
    const unsub = createTelemetrySocket(
      (incoming) => {
        setSnap(incoming)

        // Build rolling history point
        const elapsed = (Date.now() - startTimeRef.current) / 1000
        const point: HistoryPoint = {
          t: Math.round(elapsed),
          rps: incoming.requests_per_second,
          cpu: incoming.cpu_percent,
          memory: incoming.memory_percent,
          latency: incoming.latency_ms,
          error_rate: incoming.error_rate,
          threat_score: incoming.threat_score,
          availability: incoming.availability,
        }

        historyRef.current = [...historyRef.current.slice(-(MAX_HISTORY - 1)), point]
        setHistory([...historyRef.current])
      },
      setWsStatus
    )
    return unsub
  }, [])

  // Controls
  const handlePause = useCallback(async () => {
    await controlPause()
  }, [])

  const handleResume = useCallback(async () => {
    await controlResume()
  }, [])

  const handleRestart = useCallback(async (scenarioId?: string) => {
    startTimeRef.current = Date.now()
    historyRef.current = []
    setHistory([])
    await controlRestart(scenarioId)
  }, [])

  const handleSpeed = useCallback(async (m: number) => {
    await controlSpeed(m)
  }, [])

  const handleScenario = useCallback(async (id: string) => {
    startTimeRef.current = Date.now()
    historyRef.current = []
    setHistory([])
    await controlScenario(id)
  }, [])

  return {
    snap,
    history,
    wsStatus,
    scenarios,
    comparison,
    handlePause,
    handleResume,
    handleRestart,
    handleSpeed,
    handleScenario,
  }
}
