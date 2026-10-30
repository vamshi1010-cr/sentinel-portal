/**
 * Browser-side simulation engine — TypeScript port of backend/simulation/engine.py
 * Runs entirely in the browser. No network traffic, no external connections.
 */

import { SCENARIOS, type Scenario, type PhaseConfig } from './scenarios'
import type { TelemetrySnapshot, TimelineEvent, IncidentState } from '../types'

function lerp(a: number, b: number, t: number): number {
  t = Math.max(0, Math.min(1, t))
  return a + (b - a) * t
}

function noise(value: number, amplitude: number): number {
  return value + (Math.random() * 2 - 1) * amplitude
}

function randId(): string {
  return `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`
}

export class SimulationEngine {
  private scenario: Scenario
  private phaseIndex = 0
  private phaseElapsed = 0    // seconds elapsed in current phase
  private lastTick = Date.now()
  private paused = false
  private speedMultiplier = 1.0
  private timelineEvents: TimelineEvent[] = []
  private emittedEvents = new Set<string>()
  private incidentId = randId()
  private wallStart = Date.now()
  private peaks = { rps: 0, cpu: 0, latency_ms: 0, error_rate: 0, threat_score: 0 }
  private incidentDeclaredAt: number | null = null
  private incidentEndAt: number | null = null

  constructor(scenarioId = 'volumetric') {
    this.scenario = SCENARIOS[scenarioId]
  }

  pause()  { this.paused = true }
  resume() { this.paused = false; this.lastTick = Date.now() }

  setSpeed(m: number) { this.speedMultiplier = Math.max(0.1, Math.min(10, m)) }

  restart(scenarioId?: string) {
    if (scenarioId) this.scenario = SCENARIOS[scenarioId]
    this.phaseIndex = 0
    this.phaseElapsed = 0
    this.lastTick = Date.now()
    this.paused = false
    this.timelineEvents = []
    this.emittedEvents = new Set()
    this.incidentId = randId()
    this.wallStart = Date.now()
    this.peaks = { rps: 0, cpu: 0, latency_ms: 0, error_rate: 0, threat_score: 0 }
    this.incidentDeclaredAt = null
    this.incidentEndAt = null
  }

  tick(): TelemetrySnapshot {
    const now = Date.now()
    const dt = ((now - this.lastTick) / 1000) * this.speedMultiplier
    this.lastTick = now

    if (!this.paused) this.phaseElapsed += dt

    const phases = this.scenario.phases
    // Advance phase
    while (
      this.phaseIndex < phases.length - 1 &&
      this.phaseElapsed >= phases[this.phaseIndex].duration_seconds
    ) {
      this.phaseElapsed -= phases[this.phaseIndex].duration_seconds
      this.phaseIndex++
    }

    const phase = phases[this.phaseIndex]
    const t = Math.min(this.phaseElapsed / Math.max(phase.duration_seconds, 0.001), 1)

    const snap = this._buildSnapshot(phase, t)
    this._emitEvents(phase, t)
    this._updatePeaks(snap)
    return snap
  }

  private _buildSnapshot(phase: PhaseConfig, t: number): TelemetrySnapshot {
    const baseLerp = (a: number, b: number) => lerp(a, b, t)

    const rawRps   = baseLerp(phase.rps_start, phase.rps_end)
    const rps      = Math.max(0, noise(rawRps, rawRps * 0.03))
    const cpu      = Math.min(100, Math.max(0, noise(baseLerp(phase.cpu_start, phase.cpu_end), 1.2)))
    const memory   = Math.min(100, Math.max(0, noise(baseLerp(phase.memory_start, phase.memory_end), 0.8)))
    const rawLat   = baseLerp(phase.latency_start_ms, phase.latency_end_ms)
    const latency  = Math.max(0, noise(rawLat, rawLat * 0.04))
    const errRate  = Math.max(0, noise(baseLerp(phase.error_rate_start, phase.error_rate_end), 0.3))
    const avail    = Math.min(100, Math.max(0, noise(baseLerp(phase.availability_start, phase.availability_end), 0.2)))
    const susRatio = baseLerp(phase.suspicious_ratio_start, phase.suspicious_ratio_end)

    const activeUsers = Math.max(10, Math.round(rps * (0.8 + Math.random() * 0.2) / 1.1))

    // Multi-signal threat score — Demonstration Model (not scientifically validated)
    const baselineRps  = 1300
    const trafficAnom  = Math.min(100, Math.max(0, (rps / baselineRps - 1) * 35))
    const cpuAnom      = Math.min(100, Math.max(0, (cpu - 40) * 1.8))
    const latencyAnom  = Math.min(100, Math.max(0, (latency - 200) / 48))
    const errorAnom    = Math.min(100, Math.max(0, errRate * 2.8))
    const behaviorAnom = Math.min(100, Math.max(0, susRatio * 100 * 1.05))

    const rawThreat =
      trafficAnom  * 0.25 +
      cpuAnom      * 0.20 +
      latencyAnom  * 0.25 +
      errorAnom    * 0.15 +
      behaviorAnom * 0.15

    const threatScore = Math.round(
      Math.min(100, Math.max(0, noise(rawThreat, 1.5))) * 10
    ) / 10

    const state = phase.state
    const now = Date.now()
    if (state === 'INCIDENT_DECLARED' && !this.incidentDeclaredAt) this.incidentDeclaredAt = now
    if (state === 'RESOLVED' && !this.incidentEndAt) this.incidentEndAt = now

    const detectionTime = this.incidentDeclaredAt
      ? Math.round((this.incidentDeclaredAt - this.wallStart) / 100) / 10
      : null
    const recoveryTime = this.incidentDeclaredAt && this.incidentEndAt
      ? Math.round((this.incidentEndAt - this.incidentDeclaredAt) / 100) / 10
      : null

    return {
      timestamp: now / 1000,
      scenario_id: this.scenario.id,
      scenario_name: this.scenario.name,
      phase_index: this.phaseIndex,
      phase_name: phase.name,
      state,
      classification: this._classification(state),
      classification_color: ['INCIDENT_DECLARED','MITIGATION_ACTIVE','RESOLVED'].includes(state)
        ? this.scenario.classification_color
        : 'neutral',
      requests_per_second: Math.round(rps * 10) / 10,
      active_users: activeUsers,
      cpu_percent: Math.round(cpu * 10) / 10,
      memory_percent: Math.round(memory * 10) / 10,
      latency_ms: Math.round(latency * 10) / 10,
      error_rate: Math.round(errRate * 100) / 100,
      availability: Math.round(avail * 100) / 100,
      suspicious_ratio: Math.round(susRatio * 1000) / 1000,
      signal_scores: {
        traffic_anomaly:  Math.round(trafficAnom * 10) / 10,
        cpu_anomaly:      Math.round(cpuAnom * 10) / 10,
        latency_anomaly:  Math.round(latencyAnom * 10) / 10,
        error_anomaly:    Math.round(errorAnom * 10) / 10,
        behavior_anomaly: Math.round(behaviorAnom * 10) / 10,
      },
      threat_score: threatScore,
      incident_id: this.incidentId,
      detection_time_seconds: detectionTime,
      recovery_time_seconds: recoveryTime,
      peaks: { ...this.peaks },
      timeline_events: [...this.timelineEvents],
      is_paused: this.paused,
      speed_multiplier: this.speedMultiplier,
    }
  }

  private _classification(state: IncidentState): string {
    if (['INCIDENT_DECLARED', 'MITIGATION_ACTIVE', 'RESOLVED'].includes(state))
      return this.scenario.classification
    if (state === 'MONITORING') return 'MONITORING — NO INCIDENT DECLARED'
    return 'NORMAL OPERATION'
  }

  private _emitEvents(phase: PhaseConfig, t: number) {
    const n = phase.timeline_events.length
    phase.timeline_events.forEach((msg, i) => {
      const key = `${this.phaseIndex}:${i}`
      if (!this.emittedEvents.has(key) && t >= (i + 1) / (n + 1)) {
        this.emittedEvents.add(key)
        this.timelineEvents.push({
          time: Date.now() / 1000,
          phase: phase.name,
          state: phase.state,
          message: msg,
        })
      }
    })
  }

  private _updatePeaks(snap: TelemetrySnapshot) {
    this.peaks.rps          = Math.max(this.peaks.rps, snap.requests_per_second)
    this.peaks.cpu          = Math.max(this.peaks.cpu, snap.cpu_percent)
    this.peaks.latency_ms   = Math.max(this.peaks.latency_ms, snap.latency_ms)
    this.peaks.error_rate   = Math.max(this.peaks.error_rate, snap.error_rate)
    this.peaks.threat_score = Math.max(this.peaks.threat_score, snap.threat_score)
  }
}
