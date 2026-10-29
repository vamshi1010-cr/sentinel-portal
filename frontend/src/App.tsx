import { useState } from 'react'
import clsx from 'clsx'
import {
  Activity, Shield, AlertTriangle, BarChart2, FileText, GitBranch,
  Wifi, WifiOff, Users, Zap, Clock, Cpu, AlertCircle, CheckCircle
} from 'lucide-react'
import { useTelemetry } from './hooks/useTelemetry'
import { MetricCard } from './components/MetricCard'
import {
  TrafficChart, ServerHealthChart, AppPerformanceChart,
  ThreatScoreChart, AvailabilityChart
} from './components/Charts'
import { ThreatScore } from './components/ThreatScore'
import { IncidentTimeline } from './components/IncidentTimeline'
import { IncidentPhaseBar } from './components/IncidentPhaseBar'
import { PortalPreview } from './components/PortalPreview'
import { MitigationPanel } from './components/MitigationPanel'
import { IncidentReport } from './components/IncidentReport'
import { ComparisonTable } from './components/ComparisonTable'
import { DemoControls } from './components/DemoControls'
import { SystemStatus } from './components/SystemStatus'
import type { NavSection } from './types'

const NAV_ITEMS: { id: NavSection; label: string; icon: typeof Activity }[] = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'detection', label: 'Detection', icon: Shield },
  { id: 'incident', label: 'Incident', icon: AlertTriangle },
  { id: 'mitigation', label: 'Mitigation', icon: GitBranch },
  { id: 'analysis', label: 'Analysis', icon: BarChart2 },
  { id: 'report', label: 'Report', icon: FileText },
]

function cpuStatus(v: number) {
  if (v >= 85) return 'critical'
  if (v >= 65) return 'warning'
  return 'normal'
}
function latStatus(v: number) {
  if (v >= 2000) return 'critical'
  if (v >= 600) return 'warning'
  return 'normal'
}
function errStatus(v: number) {
  if (v >= 15) return 'critical'
  if (v >= 3) return 'warning'
  return 'normal'
}
function threatStatus(v: number) {
  if (v >= 75) return 'critical'
  if (v >= 45) return 'warning'
  return 'normal'
}
function availStatus(v: number) {
  if (v < 80) return 'critical'
  if (v < 95) return 'warning'
  if (v >= 99) return 'good'
  return 'normal'
}

export default function App() {
  const [nav, setNav] = useState<NavSection>('overview')
  const {
    snap, history, wsStatus, scenarios, comparison,
    handlePause, handleResume, handleRestart, handleSpeed, handleScenario,
  } = useTelemetry()

  return (
    <div className="min-h-screen bg-[#050d1a] text-slate-200 flex flex-col">
      {/* ── Top Navigation ────────────────────────────────────────────────── */}
      <header className="border-b border-[#152a52] bg-[#0a1628] sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 flex items-center gap-0 h-14">
          {/* Brand */}
          <div className="flex-shrink-0 mr-8">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="font-semibold text-white text-sm tracking-tight">SENTINEL PORTAL</span>
            </div>
            <div className="text-[9px] text-slate-500 tracking-wide pl-7 hidden sm:block">
              Autonomous Web Attack Detection & Incident Response
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setNav(item.id)}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium transition-colors',
                    nav === item.id
                      ? 'bg-blue-900/40 text-blue-300'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Right: status */}
          <div className="ml-auto flex items-center gap-3">
            {wsStatus === 'connected' ? (
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Live</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                <WifiOff className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Offline</span>
              </div>
            )}
            <div className="text-[9px] text-slate-600 font-mono border border-navy-700 rounded px-2 py-0.5 hidden lg:block">
              CONTROLLED SIMULATION
            </div>
          </div>
        </div>
      </header>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 py-4 space-y-4">

        {/* Loading state */}
        {!snap && (
          <div className="flex items-center justify-center h-64 text-slate-500 text-sm gap-2">
            <Activity className="w-4 h-4 animate-spin" />
            Connecting to simulation engine…
          </div>
        )}

        {snap && (
          <>
            {/* Status bar + phase bar */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <SystemStatus
                    state={snap.state}
                    classification={snap.classification}
                    classificationColor={snap.classification_color}
                    threatScore={snap.threat_score}
                    wsStatus={wsStatus}
                  />
                </div>
                <div className="text-xs text-slate-600 self-center flex-shrink-0 hidden lg:block">
                  Phase: <span className="text-slate-400">{snap.phase_name}</span>
                </div>
              </div>
              <IncidentPhaseBar state={snap.state} />
            </div>

            {/* Demo controls */}
            <DemoControls
              scenarios={scenarios}
              currentScenarioId={snap.scenario_id}
              isPaused={snap.is_paused}
              speed={snap.speed_multiplier}
              onPause={handlePause}
              onResume={handleResume}
              onRestart={handleRestart}
              onScenario={handleScenario}
              onSpeed={handleSpeed}
            />

            {/* ── OVERVIEW ───────────────────────────────────────────────── */}
            {nav === 'overview' && (
              <div className="space-y-4">
                {/* KPI row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <MetricCard
                    title="Active Users"
                    value={snap.active_users.toLocaleString()}
                    icon={<Users className="w-4 h-4" />}
                    status="normal"
                  />
                  <MetricCard
                    title="Requests / sec"
                    value={snap.requests_per_second >= 1000
                      ? `${(snap.requests_per_second / 1000).toFixed(1)}k`
                      : Math.round(snap.requests_per_second).toString()}
                    icon={<Zap className="w-4 h-4" />}
                    status={snap.requests_per_second > 5000 ? 'critical' : snap.requests_per_second > 2000 ? 'warning' : 'normal'}
                  />
                  <MetricCard
                    title="Avg Latency"
                    value={snap.latency_ms >= 1000
                      ? `${(snap.latency_ms / 1000).toFixed(2)}s`
                      : `${Math.round(snap.latency_ms)}`}
                    unit={snap.latency_ms >= 1000 ? '' : 'ms'}
                    icon={<Clock className="w-4 h-4" />}
                    status={latStatus(snap.latency_ms)}
                  />
                  <MetricCard
                    title="CPU"
                    value={snap.cpu_percent.toFixed(1)}
                    unit="%"
                    icon={<Cpu className="w-4 h-4" />}
                    status={cpuStatus(snap.cpu_percent)}
                  />
                  <MetricCard
                    title="Error Rate"
                    value={snap.error_rate.toFixed(1)}
                    unit="%"
                    icon={<AlertCircle className="w-4 h-4" />}
                    status={errStatus(snap.error_rate)}
                  />
                  <MetricCard
                    title="Threat Score"
                    value={`${snap.threat_score.toFixed(0)} / 100`}
                    icon={<Shield className="w-4 h-4" />}
                    status={threatStatus(snap.threat_score)}
                  />
                </div>

                {/* Charts — 2 col */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <TrafficChart history={history} />
                  <ServerHealthChart history={history} />
                  <AppPerformanceChart history={history} />
                  <ThreatScoreChart history={history} />
                  <AvailabilityChart history={history} />
                  <PortalPreview
                    state={snap.state}
                    availability={snap.availability}
                    latencyMs={snap.latency_ms}
                  />
                </div>
              </div>
            )}

            {/* ── DETECTION ──────────────────────────────────────────────── */}
            {nav === 'detection' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <ThreatScore score={snap.threat_score} signals={snap.signal_scores} />
                  <div className="bg-navy-900 border border-navy-700 rounded-lg p-4 space-y-3">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Detection State</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Traffic Anomaly', v: snap.signal_scores.traffic_anomaly },
                        { label: 'CPU Anomaly', v: snap.signal_scores.cpu_anomaly },
                        { label: 'Latency Anomaly', v: snap.signal_scores.latency_anomaly },
                        { label: 'Error Anomaly', v: snap.signal_scores.error_anomaly },
                        { label: 'Behaviour Anomaly', v: snap.signal_scores.behavior_anomaly },
                        { label: 'Overall', v: snap.threat_score },
                      ].map(({ label, v }) => (
                        <div key={label} className="bg-navy-800 border border-navy-700 rounded p-2">
                          <div className="text-[10px] text-slate-500">{label}</div>
                          <div className={clsx(
                            'text-lg font-bold font-mono',
                            v >= 75 ? 'text-red-400' : v >= 45 ? 'text-amber-400' : 'text-emerald-400'
                          )}>{v.toFixed(1)}</div>
                          <div className="text-[10px] text-slate-600">/ 100</div>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-600 italic">
                      Signal weights: Traffic 25%, CPU 20%, Latency 25%, Error 15%, Behaviour 15%.
                      These weights are configurable and are for demonstration purposes only.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <ThreatScoreChart history={history} />
                  <AppPerformanceChart history={history} />
                  <ServerHealthChart history={history} />
                </div>
              </div>
            )}

            {/* ── INCIDENT ───────────────────────────────────────────────── */}
            {nav === 'incident' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <IncidentTimeline events={snap.timeline_events} />
                </div>
                <div className="space-y-4">
                  <PortalPreview
                    state={snap.state}
                    availability={snap.availability}
                    latencyMs={snap.latency_ms}
                  />
                  <TrafficChart history={history} />
                  <div className="bg-navy-900 border border-navy-700 rounded-lg p-4">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Scenario Details</h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Scenario</span>
                        <span className="text-slate-200 font-medium">{snap.scenario_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Current Phase</span>
                        <span className="text-slate-200">{snap.phase_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Incident ID</span>
                        <span className="text-slate-200 font-mono">{snap.incident_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Classification</span>
                        <span className={clsx(
                          'font-medium',
                          snap.classification_color === 'red' ? 'text-red-300' :
                          snap.classification_color === 'amber' ? 'text-amber-300' :
                          snap.classification_color === 'green' ? 'text-emerald-300' :
                          'text-slate-300'
                        )}>{snap.classification}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── MITIGATION ─────────────────────────────────────────────── */}
            {nav === 'mitigation' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <MitigationPanel state={snap.state} />
                </div>
                <div className="space-y-4">
                  <AvailabilityChart history={history} />
                  <ServerHealthChart history={history} />
                  <div className="bg-navy-900 border border-navy-700 rounded-lg p-4 space-y-3">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recovery Metrics</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'Availability', v: snap.availability, unit: '%', good: snap.availability >= 99 },
                        { label: 'Error Rate', v: snap.error_rate, unit: '%', good: snap.error_rate < 1 },
                        { label: 'CPU', v: snap.cpu_percent, unit: '%', good: snap.cpu_percent < 50 },
                        { label: 'Threat Score', v: snap.threat_score, unit: '/100', good: snap.threat_score < 25 },
                      ].map(({ label, v, unit, good }) => (
                        <div key={label} className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">{label}</span>
                          <div className="flex items-center gap-2">
                            <span className={clsx(
                              'text-sm font-mono font-bold',
                              good ? 'text-emerald-400' : 'text-slate-200'
                            )}>
                              {v.toFixed(1)}{unit}
                            </span>
                            {good && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── ANALYSIS (Research mode) ────────────────────────────────── */}
            {nav === 'analysis' && (
              <div className="space-y-4">
                {comparison && <ComparisonTable data={comparison} />}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <TrafficChart history={history} />
                  <ThreatScoreChart history={history} />
                </div>
                <div className="bg-navy-900 border border-navy-700 rounded-lg p-5">
                  <h3 className="text-sm font-semibold text-white mb-2">Research Context</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    This demonstration supports the research topic: <em>"DoS Attack on an Online Portal — A Research Case Study on Attack Detection, Security Analysis and Prevention."</em>
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    The proposed <strong className="text-slate-200">Multi-Signal Website Attack Detection Framework</strong> correlates
                    four signal categories simultaneously:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      '① Traffic metrics (requests/sec, volume patterns)',
                      '② Server performance (CPU, memory utilisation)',
                      '③ Application metrics (latency, error rate, availability)',
                      '④ Request behaviour (suspicious request ratio, pattern analysis)',
                    ].map(item => (
                      <div key={item} className="bg-navy-800 border border-navy-700 rounded px-3 py-2 text-xs text-slate-300">
                        {item}
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-600 mt-4 italic">
                    The low-and-slow scenario (Scenario 2) and legitimate surge scenario (Scenario 3) are designed specifically
                    to illustrate why traffic volume alone is insufficient as a detection signal.
                    This is a conceptual demonstration — not an experimentally validated result.
                  </p>
                </div>
              </div>
            )}

            {/* ── REPORT ─────────────────────────────────────────────────── */}
            {nav === 'report' && (
              <div className="max-w-2xl">
                <IncidentReport snap={snap} />
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-navy-800 py-2 px-4 text-[9px] text-slate-700 flex items-center gap-4 max-w-screen-2xl mx-auto w-full">
        <span>Sentinel Portal — Academic Research Demonstration</span>
        <span>·</span>
        <span>All telemetry is synthetic. No real network traffic is generated.</span>
        <span>·</span>
        <span>DoS Attack on an Online Portal — Research Case Study</span>
      </footer>
    </div>
  )
}

