import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import type { HistoryPoint } from '../types'

interface Props {
  history: HistoryPoint[]
}

const CHART_COMMON = {
  margin: { top: 4, right: 8, left: 0, bottom: 0 },
}

const GRID_PROPS = {
  strokeDasharray: '3 3',
  stroke: '#1d3a6e',
  vertical: false,
}

const AXIS_STYLE = { fontSize: 10, fill: '#64748b' }

function formatK(v: number) {
  if (v >= 1000) return `${(v / 1000).toFixed(0)}k`
  return String(Math.round(v))
}

export function TrafficChart({ history }: Props) {
  return (
    <div className="bg-navy-900 border border-navy-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Requests / Second</h3>
        <span className="text-xs text-slate-500 font-mono">
          {history.length > 0 ? `${formatK(history[history.length - 1].rps)} req/s` : '—'}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={history} {...CHART_COMMON}>
          <defs>
            <linearGradient id="rpsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...GRID_PROPS} />
          <XAxis dataKey="t" tick={AXIS_STYLE} tickFormatter={(v) => `${v}s`} interval="preserveStartEnd" />
          <YAxis tick={AXIS_STYLE} tickFormatter={formatK} width={32} />
          <Tooltip
            formatter={(v: number) => [`${v.toLocaleString()} req/s`, 'Requests/sec']}
            labelFormatter={(l) => `T+${l}s`}
            contentStyle={{ background: '#0f2040', border: '1px solid #1d3a6e', borderRadius: 6, fontSize: 11 }}
          />
          <Area type="monotone" dataKey="rps" stroke="#3b82f6" fill="url(#rpsGrad)" strokeWidth={2} dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ServerHealthChart({ history }: Props) {
  return (
    <div className="bg-navy-900 border border-navy-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Server Health</h3>
        <div className="flex gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />CPU</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />Memory</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={history} {...CHART_COMMON}>
          <CartesianGrid {...GRID_PROPS} />
          <XAxis dataKey="t" tick={AXIS_STYLE} tickFormatter={(v) => `${v}s`} interval="preserveStartEnd" />
          <YAxis tick={AXIS_STYLE} domain={[0, 100]} tickFormatter={(v) => `${v}%`} width={36} />
          <Tooltip
            formatter={(v: number, name: string) => [`${v.toFixed(1)}%`, name === 'cpu' ? 'CPU' : 'Memory']}
            labelFormatter={(l) => `T+${l}s`}
            contentStyle={{ background: '#0f2040', border: '1px solid #1d3a6e', borderRadius: 6, fontSize: 11 }}
          />
          <Line type="monotone" dataKey="cpu" name="cpu" stroke="#38bdf8" strokeWidth={2} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="memory" name="memory" stroke="#a78bfa" strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function AppPerformanceChart({ history }: Props) {
  return (
    <div className="bg-navy-900 border border-navy-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Application Performance</h3>
        <div className="flex gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Latency (ms)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Error %</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={history} {...CHART_COMMON}>
          <CartesianGrid {...GRID_PROPS} />
          <XAxis dataKey="t" tick={AXIS_STYLE} tickFormatter={(v) => `${v}s`} interval="preserveStartEnd" />
          <YAxis yAxisId="lat" tick={AXIS_STYLE} tickFormatter={(v) => `${v}ms`} width={40} />
          <YAxis yAxisId="err" orientation="right" tick={AXIS_STYLE} tickFormatter={(v) => `${v}%`} width={32} domain={[0, 100]} />
          <Tooltip
            formatter={(v: number, name: string) =>
              name === 'latency' ? [`${v.toFixed(0)} ms`, 'Latency'] : [`${v.toFixed(1)}%`, 'Error Rate']
            }
            labelFormatter={(l) => `T+${l}s`}
            contentStyle={{ background: '#0f2040', border: '1px solid #1d3a6e', borderRadius: 6, fontSize: 11 }}
          />
          <Line yAxisId="lat" type="monotone" dataKey="latency" name="latency" stroke="#fbbf24" strokeWidth={2} dot={false} isAnimationActive={false} />
          <Line yAxisId="err" type="monotone" dataKey="error_rate" name="error_rate" stroke="#f87171" strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ThreatScoreChart({ history }: Props) {
  return (
    <div className="bg-navy-900 border border-navy-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Threat Score (0–100)</h3>
        <span className="text-xs text-slate-400 italic">Demonstration Model</span>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={history} {...CHART_COMMON}>
          <defs>
            <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...GRID_PROPS} />
          <XAxis dataKey="t" tick={AXIS_STYLE} tickFormatter={(v) => `${v}s`} interval="preserveStartEnd" />
          <YAxis tick={AXIS_STYLE} domain={[0, 100]} width={28} />
          <Tooltip
            formatter={(v: number) => [`${v.toFixed(1)}`, 'Threat Score']}
            labelFormatter={(l) => `T+${l}s`}
            contentStyle={{ background: '#0f2040', border: '1px solid #1d3a6e', borderRadius: 6, fontSize: 11 }}
          />
          <Area type="monotone" dataKey="threat_score" stroke="#ef4444" fill="url(#threatGrad)" strokeWidth={2} dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function AvailabilityChart({ history }: Props) {
  return (
    <div className="bg-navy-900 border border-navy-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Service Availability (%)</h3>
        <span className="text-xs text-slate-500 font-mono">
          {history.length > 0 ? `${history[history.length - 1].availability.toFixed(1)}%` : '—'}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={history} {...CHART_COMMON}>
          <defs>
            <linearGradient id="availGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...GRID_PROPS} />
          <XAxis dataKey="t" tick={AXIS_STYLE} tickFormatter={(v) => `${v}s`} interval="preserveStartEnd" />
          <YAxis tick={AXIS_STYLE} domain={[0, 100]} tickFormatter={(v) => `${v}%`} width={36} />
          <Tooltip
            formatter={(v: number) => [`${v.toFixed(2)}%`, 'Availability']}
            labelFormatter={(l) => `T+${l}s`}
            contentStyle={{ background: '#0f2040', border: '1px solid #1d3a6e', borderRadius: 6, fontSize: 11 }}
          />
          <Area type="monotone" dataKey="availability" stroke="#34d399" fill="url(#availGrad)" strokeWidth={2} dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
