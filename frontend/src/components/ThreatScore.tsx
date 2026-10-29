import clsx from 'clsx'
import type { SignalScores } from '../types'

interface Props {
  score: number
  signals: SignalScores
}

const SIGNAL_LABELS: Record<keyof SignalScores, string> = {
  traffic_anomaly: 'Traffic Anomaly',
  cpu_anomaly: 'CPU Anomaly',
  latency_anomaly: 'Latency Anomaly',
  error_anomaly: 'Error Rate Anomaly',
  behavior_anomaly: 'Request Behaviour',
}

const SIGNAL_WEIGHTS: Record<keyof SignalScores, number> = {
  traffic_anomaly: 0.25,
  cpu_anomaly: 0.20,
  latency_anomaly: 0.25,
  error_anomaly: 0.15,
  behavior_anomaly: 0.15,
}

function scoreColor(v: number) {
  if (v >= 75) return 'text-red-400'
  if (v >= 45) return 'text-amber-400'
  return 'text-emerald-400'
}

function barColor(v: number) {
  if (v >= 75) return 'bg-red-500'
  if (v >= 45) return 'bg-amber-500'
  return 'bg-emerald-500'
}

function overallColor(v: number) {
  if (v >= 75) return 'text-red-400 border-red-700'
  if (v >= 45) return 'text-amber-400 border-amber-700'
  return 'text-emerald-400 border-emerald-800'
}

export function ThreatScore({ score, signals }: Props) {
  return (
    <div className="bg-navy-900 border border-navy-700 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Multi-Signal Detection Engine</h3>
        <span className="text-[10px] text-slate-500 italic">Demonstration Model — not scientifically validated</span>
      </div>

      {/* Overall score */}
      <div className={clsx(
        'flex items-center gap-4 border rounded-lg p-3',
        overallColor(score)
      )}>
        <div className="text-4xl font-bold font-mono tabular-nums">{score}</div>
        <div>
          <div className="text-sm font-semibold">Overall Threat Score</div>
          <div className="text-xs text-slate-400">Weighted combination of 5 signals</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-xs text-slate-400">Threshold</div>
          <div className="text-sm font-mono">85</div>
        </div>
      </div>

      {/* Signal breakdown */}
      <div className="space-y-2">
        {(Object.entries(signals) as [keyof SignalScores, number][]).map(([key, val]) => (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">{SIGNAL_LABELS[key]}</span>
              <div className="flex items-center gap-3">
                <span className="text-slate-500 text-[10px]">weight {(SIGNAL_WEIGHTS[key] * 100).toFixed(0)}%</span>
                <span className={clsx('font-mono font-semibold w-16 text-right', scoreColor(val))}>
                  {val.toFixed(1)} / 100
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-navy-800 rounded-full overflow-hidden">
              <div
                className={clsx('h-full rounded-full transition-all duration-700', barColor(val))}
                style={{ width: `${Math.min(100, val)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
