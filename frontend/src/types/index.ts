// All types used throughout the application.
// Telemetry data is purely synthetic — no real network measurements.

export interface SignalScores {
  traffic_anomaly: number
  cpu_anomaly: number
  latency_anomaly: number
  error_anomaly: number
  behavior_anomaly: number
}

export interface PeakMetrics {
  rps: number
  cpu: number
  latency_ms: number
  error_rate: number
  threat_score: number
}

export interface TimelineEvent {
  time: number  // unix timestamp (float)
  phase: string
  state: string
  message: string
}

export interface TelemetrySnapshot {
  timestamp: number
  scenario_id: string
  scenario_name: string
  phase_index: number
  phase_name: string
  state: IncidentState
  classification: string
  classification_color: 'neutral' | 'green' | 'amber' | 'red'
  requests_per_second: number
  active_users: number
  cpu_percent: number
  memory_percent: number
  latency_ms: number
  error_rate: number
  availability: number
  suspicious_ratio: number
  signal_scores: SignalScores
  threat_score: number
  incident_id: string
  detection_time_seconds: number | null
  recovery_time_seconds: number | null
  peaks: PeakMetrics
  timeline_events: TimelineEvent[]
  is_paused: boolean
  speed_multiplier: number
}

export type IncidentState =
  | 'NORMAL'
  | 'MONITORING'
  | 'ANOMALY_DETECTED'
  | 'INVESTIGATING'
  | 'SUSPICIOUS_ACTIVITY'
  | 'INCIDENT_DECLARED'
  | 'MITIGATION_ACTIVE'
  | 'RECOVERING'
  | 'RESOLVED'

export interface ScenarioInfo {
  id: string
  name: string
  description: string
  classification: string
  classification_color: string
  phases: string[]
}

export interface ComparisonRow {
  event_type: string
  traffic_only: string
  traffic_only_color: string
  multi_signal: string
  multi_signal_color: string
  notes: string
}

export interface ComparisonData {
  label: string
  rows: ComparisonRow[]
}

export type NavSection = 'overview' | 'detection' | 'incident' | 'mitigation' | 'analysis' | 'report'

// Rolling history point for charts
export interface HistoryPoint {
  t: number   // seconds since start
  rps: number
  cpu: number
  memory: number
  latency: number
  error_rate: number
  threat_score: number
  availability: number
}
