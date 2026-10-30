/**
 * Simulation scenarios — TypeScript port of backend/simulation/scenarios.py
 * All data is synthetic. No real traffic is generated.
 */

import type { IncidentState } from '../types'

export interface PhaseConfig {
  name: string
  duration_seconds: number
  rps_start: number; rps_end: number
  cpu_start: number; cpu_end: number
  memory_start: number; memory_end: number
  latency_start_ms: number; latency_end_ms: number
  error_rate_start: number; error_rate_end: number
  availability_start: number; availability_end: number
  suspicious_ratio_start: number; suspicious_ratio_end: number
  state: IncidentState
  timeline_events: string[]
}

export interface Scenario {
  id: string
  name: string
  description: string
  classification: string
  classification_color: 'neutral' | 'green' | 'amber' | 'red'
  phases: PhaseConfig[]
}

// ── SCENARIO 1 — Sudden Volumetric Flood ───────────────────────────────────────
const scenario_volumetric: Scenario = {
  id: 'volumetric',
  name: 'Sudden Volumetric Event',
  description: 'A rapid traffic surge from many sources overwhelms the portal. All detection signals escalate simultaneously.',
  classification: 'HIGH-CONFIDENCE TRAFFIC FLOOD',
  classification_color: 'red',
  phases: [
    {
      name: 'Normal Operation', duration_seconds: 15,
      rps_start: 1100, rps_end: 1350,
      cpu_start: 35, cpu_end: 42,
      memory_start: 52, memory_end: 55,
      latency_start_ms: 155, latency_end_ms: 195,
      error_rate_start: 0.4, error_rate_end: 0.7,
      availability_start: 99.6, availability_end: 99.4,
      suspicious_ratio_start: 0.01, suspicious_ratio_end: 0.02,
      state: 'NORMAL',
      timeline_events: ['System initialized. All metrics within baseline parameters.'],
    },
    {
      name: 'Early Anomaly', duration_seconds: 10,
      rps_start: 2800, rps_end: 8500,
      cpu_start: 43, cpu_end: 62,
      memory_start: 56, memory_end: 65,
      latency_start_ms: 260, latency_end_ms: 640,
      error_rate_start: 1.2, error_rate_end: 6.1,
      availability_start: 98.8, availability_end: 94.0,
      suspicious_ratio_start: 0.28, suspicious_ratio_end: 0.58,
      state: 'ANOMALY_DETECTED',
      timeline_events: [
        'Traffic anomaly detected — requests/sec above 2× baseline',
        'Server CPU utilization increasing above normal threshold',
      ],
    },
    {
      name: 'Investigation', duration_seconds: 8,
      rps_start: 12000, rps_end: 24000,
      cpu_start: 64, cpu_end: 83,
      memory_start: 66, memory_end: 75,
      latency_start_ms: 900, latency_end_ms: 2200,
      error_rate_start: 9.0, error_rate_end: 22.4,
      availability_start: 91.0, availability_end: 77.6,
      suspicious_ratio_start: 0.62, suspicious_ratio_end: 0.81,
      state: 'INVESTIGATING',
      timeline_events: [
        'Latency threshold exceeded (>500 ms P95)',
        'Error rate exceeded 5% — application stress confirmed',
        'Multiple abnormal indicators correlated by detection engine',
      ],
    },
    {
      name: 'Incident Declared', duration_seconds: 6,
      rps_start: 32000, rps_end: 48200,
      cpu_start: 85, cpu_end: 97,
      memory_start: 76, memory_end: 89,
      latency_start_ms: 2800, latency_end_ms: 4820,
      error_rate_start: 26.0, error_rate_end: 36.7,
      availability_start: 74.0, availability_end: 63.2,
      suspicious_ratio_start: 0.84, suspicious_ratio_end: 0.91,
      state: 'INCIDENT_DECLARED',
      timeline_events: [
        'Threat confidence exceeded incident threshold (>85/100)',
        'SECURITY INCIDENT DECLARED — INC-2026-1042',
        'Mitigation policy activation initiated',
      ],
    },
    {
      name: 'Mitigation Active', duration_seconds: 10,
      rps_start: 48200, rps_end: 18000,
      cpu_start: 97, cpu_end: 74,
      memory_start: 89, memory_end: 71,
      latency_start_ms: 4820, latency_end_ms: 1600,
      error_rate_start: 36.7, error_rate_end: 14.2,
      availability_start: 63.2, availability_end: 85.8,
      suspicious_ratio_start: 0.91, suspicious_ratio_end: 0.42,
      state: 'MITIGATION_ACTIVE',
      timeline_events: [
        'Rate limiting policy activated',
        'Suspicious traffic patterns filtered',
        'Traffic protection layer engaged',
        'Error rate beginning to decrease',
      ],
    },
    {
      name: 'Recovery', duration_seconds: 12,
      rps_start: 18000, rps_end: 1380,
      cpu_start: 74, cpu_end: 41,
      memory_start: 71, memory_end: 53,
      latency_start_ms: 1600, latency_end_ms: 188,
      error_rate_start: 14.2, error_rate_end: 0.6,
      availability_start: 85.8, availability_end: 99.5,
      suspicious_ratio_start: 0.42, suspicious_ratio_end: 0.02,
      state: 'RECOVERING',
      timeline_events: [
        'Traffic volume returning to baseline',
        'Service latency normalising',
        'Service recovery detected',
        'INCIDENT RESOLVED — All systems operational',
      ],
    },
    {
      name: 'Post-Incident', duration_seconds: 999999,
      rps_start: 1350, rps_end: 1420,
      cpu_start: 40, cpu_end: 43,
      memory_start: 53, memory_end: 54,
      latency_start_ms: 180, latency_end_ms: 195,
      error_rate_start: 0.5, error_rate_end: 0.6,
      availability_start: 99.5, availability_end: 99.6,
      suspicious_ratio_start: 0.01, suspicious_ratio_end: 0.02,
      state: 'RESOLVED',
      timeline_events: ['Post-incident monitoring active. Report available.'],
    },
  ],
}

// ── SCENARIO 2 — Low-and-Slow Resource Exhaustion ──────────────────────────────
const scenario_slow: Scenario = {
  id: 'slow',
  name: 'Low-and-Slow Resource Exhaustion',
  description: 'Traffic rises only slightly, yet CPU and latency climb steadily. Traffic-only detection would miss this. Multi-signal correlation catches it.',
  classification: 'POSSIBLE LOW-AND-SLOW RESOURCE EXHAUSTION',
  classification_color: 'amber',
  phases: [
    {
      name: 'Normal Operation', duration_seconds: 15,
      rps_start: 1150, rps_end: 1260,
      cpu_start: 38, cpu_end: 42,
      memory_start: 50, memory_end: 52,
      latency_start_ms: 160, latency_end_ms: 185,
      error_rate_start: 0.3, error_rate_end: 0.5,
      availability_start: 99.7, availability_end: 99.5,
      suspicious_ratio_start: 0.01, suspicious_ratio_end: 0.02,
      state: 'NORMAL',
      timeline_events: ['System initialized. All metrics within baseline parameters.'],
    },
    {
      name: 'Subtle Increase', duration_seconds: 12,
      rps_start: 1350, rps_end: 1700,
      cpu_start: 44, cpu_end: 58,
      memory_start: 53, memory_end: 62,
      latency_start_ms: 210, latency_end_ms: 420,
      error_rate_start: 0.7, error_rate_end: 2.1,
      availability_start: 99.3, availability_end: 97.9,
      suspicious_ratio_start: 0.03, suspicious_ratio_end: 0.12,
      state: 'MONITORING',
      timeline_events: [
        'CPU utilization trend above expected baseline',
        'Latency increase noted — not yet threshold-level',
      ],
    },
    {
      name: 'Anomaly Correlation', duration_seconds: 10,
      rps_start: 1950, rps_end: 2400,
      cpu_start: 62, cpu_end: 76,
      memory_start: 64, memory_end: 73,
      latency_start_ms: 620, latency_end_ms: 1100,
      error_rate_start: 3.8, error_rate_end: 7.6,
      availability_start: 96.2, availability_end: 92.4,
      suspicious_ratio_start: 0.18, suspicious_ratio_end: 0.34,
      state: 'ANOMALY_DETECTED',
      timeline_events: [
        'Multi-signal correlation: CPU + latency anomaly without proportional traffic increase',
        'Traffic volume alone does not confirm attack — investigation continues',
        'Request behaviour anomaly detected',
      ],
    },
    {
      name: 'Incident Declared', duration_seconds: 8,
      rps_start: 2800, rps_end: 3200,
      cpu_start: 79, cpu_end: 88,
      memory_start: 75, memory_end: 82,
      latency_start_ms: 1500, latency_end_ms: 2400,
      error_rate_start: 11.0, error_rate_end: 18.5,
      availability_start: 89.0, availability_end: 81.5,
      suspicious_ratio_start: 0.41, suspicious_ratio_end: 0.57,
      state: 'INCIDENT_DECLARED',
      timeline_events: [
        'Multi-signal threat score exceeded threshold',
        'SECURITY INCIDENT DECLARED — INC-2026-1043',
        'Note: Traffic-only detection would not have triggered here',
        'Mitigation policy activation initiated',
      ],
    },
    {
      name: 'Mitigation Active', duration_seconds: 10,
      rps_start: 3200, rps_end: 1900,
      cpu_start: 88, cpu_end: 66,
      memory_start: 82, memory_end: 67,
      latency_start_ms: 2400, latency_end_ms: 820,
      error_rate_start: 18.5, error_rate_end: 7.2,
      availability_start: 81.5, availability_end: 92.8,
      suspicious_ratio_start: 0.57, suspicious_ratio_end: 0.21,
      state: 'MITIGATION_ACTIVE',
      timeline_events: [
        'Application-layer connection limits enforced',
        'Long-running request timeout policy applied',
        'Load redistribution initiated',
      ],
    },
    {
      name: 'Recovery', duration_seconds: 12,
      rps_start: 1900, rps_end: 1250,
      cpu_start: 66, cpu_end: 40,
      memory_start: 67, memory_end: 51,
      latency_start_ms: 820, latency_end_ms: 175,
      error_rate_start: 7.2, error_rate_end: 0.4,
      availability_start: 92.8, availability_end: 99.6,
      suspicious_ratio_start: 0.21, suspicious_ratio_end: 0.02,
      state: 'RECOVERING',
      timeline_events: [
        'Resource utilisation returning to baseline',
        'INCIDENT RESOLVED — All systems operational',
      ],
    },
    {
      name: 'Post-Incident', duration_seconds: 999999,
      rps_start: 1250, rps_end: 1350,
      cpu_start: 39, cpu_end: 42,
      memory_start: 51, memory_end: 53,
      latency_start_ms: 170, latency_end_ms: 190,
      error_rate_start: 0.3, error_rate_end: 0.5,
      availability_start: 99.6, availability_end: 99.7,
      suspicious_ratio_start: 0.01, suspicious_ratio_end: 0.02,
      state: 'RESOLVED',
      timeline_events: ['Post-incident monitoring active. Report available.'],
    },
  ],
}

// ── SCENARIO 3 — Legitimate Traffic Surge (False Positive Demo) ─────────────────
const scenario_legitimate: Scenario = {
  id: 'legitimate',
  name: 'Legitimate Traffic Surge',
  description: 'A campus event causes a large traffic spike. CPU and latency remain manageable. The detection engine correctly classifies this as NOT an attack.',
  classification: 'LIKELY LEGITIMATE TRAFFIC SURGE',
  classification_color: 'green',
  phases: [
    {
      name: 'Normal Operation', duration_seconds: 15,
      rps_start: 1100, rps_end: 1300,
      cpu_start: 36, cpu_end: 40,
      memory_start: 51, memory_end: 53,
      latency_start_ms: 158, latency_end_ms: 182,
      error_rate_start: 0.3, error_rate_end: 0.5,
      availability_start: 99.7, availability_end: 99.5,
      suspicious_ratio_start: 0.01, suspicious_ratio_end: 0.01,
      state: 'NORMAL',
      timeline_events: ['System initialized. All metrics within baseline parameters.'],
    },
    {
      name: 'Traffic Growth', duration_seconds: 12,
      rps_start: 3800, rps_end: 8200,
      cpu_start: 41, cpu_end: 52,
      memory_start: 54, memory_end: 59,
      latency_start_ms: 190, latency_end_ms: 230,
      error_rate_start: 0.6, error_rate_end: 1.1,
      availability_start: 99.4, availability_end: 98.9,
      suspicious_ratio_start: 0.02, suspicious_ratio_end: 0.04,
      state: 'MONITORING',
      timeline_events: [
        'Traffic increase detected — volume above 3× baseline',
        'CPU and latency remain within acceptable parameters',
        'Request behaviour consistent with normal user patterns',
      ],
    },
    {
      name: 'High Traffic', duration_seconds: 14,
      rps_start: 10000, rps_end: 15200,
      cpu_start: 54, cpu_end: 63,
      memory_start: 60, memory_end: 65,
      latency_start_ms: 245, latency_end_ms: 290,
      error_rate_start: 1.3, error_rate_end: 1.8,
      availability_start: 98.7, availability_end: 98.2,
      suspicious_ratio_start: 0.04, suspicious_ratio_end: 0.05,
      state: 'MONITORING',
      timeline_events: [
        'High traffic volume sustained — resource utilisation stable',
        'No request behaviour anomaly detected',
        'Multi-signal assessment: traffic HIGH, stress LOW, behaviour NORMAL',
        'Classification: LIKELY LEGITIMATE TRAFFIC SURGE',
      ],
    },
    {
      name: 'Gradual Decline', duration_seconds: 14,
      rps_start: 15200, rps_end: 1800,
      cpu_start: 63, cpu_end: 41,
      memory_start: 65, memory_end: 53,
      latency_start_ms: 290, latency_end_ms: 195,
      error_rate_start: 1.8, error_rate_end: 0.5,
      availability_start: 98.2, availability_end: 99.5,
      suspicious_ratio_start: 0.05, suspicious_ratio_end: 0.01,
      state: 'MONITORING',
      timeline_events: [
        'Traffic volume returning to baseline naturally',
        'No mitigation was required',
        'System remained fully operational throughout event',
      ],
    },
    {
      name: 'Post-Event', duration_seconds: 999999,
      rps_start: 1400, rps_end: 1500,
      cpu_start: 40, cpu_end: 42,
      memory_start: 52, memory_end: 53,
      latency_start_ms: 182, latency_end_ms: 192,
      error_rate_start: 0.4, error_rate_end: 0.5,
      availability_start: 99.6, availability_end: 99.5,
      suspicious_ratio_start: 0.01, suspicious_ratio_end: 0.01,
      state: 'RESOLVED',
      timeline_events: ['Event concluded. No incident declared. Report available.'],
    },
  ],
}

export const SCENARIOS: Record<string, Scenario> = {
  volumetric: scenario_volumetric,
  slow: scenario_slow,
  legitimate: scenario_legitimate,
}
