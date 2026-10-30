/**
 * useTelemetry — runs the SimulationEngine entirely in the browser.
 * No WebSocket or backend required. Works on GitHub Pages.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import type { TelemetrySnapshot, HistoryPoint, ComparisonData } from '../types'
import { SimulationEngine } from '../simulation/engine'
import { SCENARIOS } from '../simulation/scenarios'

const MAX_HISTORY = 60

// Static comparison data (was served by the backend, now inline)
const COMPARISON_DATA: ComparisonData = {
  label: 'Conceptual Demonstration — Simulation-Based Comparison',
  rows: [
    {
      event_type: 'Legitimate Traffic Surge',
      traffic_only: 'FALSE ALERT',
      traffic_only_color: 'red',
      multi_signal: 'NORMAL',
      multi_signal_color: 'green',
      notes: 'High volume but low resource stress and normal behaviour patterns.',
    },
    {
      event_type: 'Volumetric Flood',
      traffic_only: 'DETECTED',
      traffic_only_color: 'green',
      multi_signal: 'DETECTED',
      multi_signal_color: 'green',
      notes: 'Both methods detect. Multi-signal provides higher confidence.',
    },
    {
      event_type: 'Low-and-Slow Exhaustion',
      traffic_only: 'UNCERTAIN',
      traffic_only_color: 'amber',
      multi_signal: 'DETECTED',
      multi_signal_color: 'green',
      notes: 'Traffic barely rises; CPU, latency and behaviour anomalies trigger detection.',
    },
    {
      event_type: 'Resource Exhaustion',
      traffic_only: 'UNCERTAIN',
      traffic_only_color: 'amber',
      multi_signal: 'DETECTED',
      multi_signal_color: 'green',
      notes: 'Application-layer stress detected without volumetric flood.',
    },
  ],
}

export function useTelemetry() {
  const engineRef = useRef<SimulationEngine>(new SimulationEngine('volumetric'))
  const [snap, setSnap] = useState<TelemetrySnapshot | null>(null)
  const [history, setHistory] = useState<HistoryPoint[]>([])
  const historyRef = useRef<HistoryPoint[]>([])
  const startRef = useRef<number>(Date.now())

  // Build scenario list from the scenarios map
  const scenarios = Object.values(SCENARIOS).map(s => ({
    id: s.id,
    name: s.name,
    description: s.description,
    classification: s.classification,
    classification_color: s.classification_color,
    phases: s.phases.map(p => p.name),
  }))

  // Tick loop at 800 ms
  useEffect(() => {
    const id = setInterval(() => {
      const incoming = engineRef.current.tick()
      setSnap(incoming)

      const elapsed = Math.round((Date.now() - startRef.current) / 1000)
      const point: HistoryPoint = {
        t: elapsed,
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
    }, 800)

    return () => clearInterval(id)
  }, [])

  const handlePause = useCallback(() => { engineRef.current.pause() }, [])
  const handleResume = useCallback(() => { engineRef.current.resume() }, [])

  const handleRestart = useCallback((scenarioId?: string) => {
    startRef.current = Date.now()
    historyRef.current = []
    setHistory([])
    engineRef.current.restart(scenarioId)
  }, [])

  const handleSpeed = useCallback((m: number) => { engineRef.current.setSpeed(m) }, [])

  const handleScenario = useCallback((id: string) => {
    startRef.current = Date.now()
    historyRef.current = []
    setHistory([])
    engineRef.current.restart(id)
  }, [])

  return {
    snap,
    history,
    wsStatus: 'connected' as const,   // always live — engine runs in-browser
    scenarios,
    comparison: COMPARISON_DATA,
    handlePause,
    handleResume,
    handleRestart,
    handleSpeed,
    handleScenario,
  }
}
