import clsx from 'clsx'
import type { IncidentState } from '../types'

interface Props {
  state: IncidentState
}

const STEPS = [
  { key: 'NORMAL', label: 'Normal', desc: 'Baseline operation' },
  { key: 'ANOMALY_DETECTED', label: 'Early Anomaly', desc: 'First signals' },
  { key: 'INVESTIGATING', label: 'Investigation', desc: 'Correlating signals' },
  { key: 'INCIDENT_DECLARED', label: 'Incident', desc: 'Threshold exceeded' },
  { key: 'MITIGATION_ACTIVE', label: 'Mitigation', desc: 'Response active' },
  { key: 'RECOVERING', label: 'Recovery', desc: 'Service restoring' },
  { key: 'RESOLVED', label: 'Resolved', desc: 'Report available' },
]

const ORDER = STEPS.map(s => s.key)

export function IncidentPhaseBar({ state }: Props) {
  const current = ORDER.indexOf(state)
  const resolved = current < 0 ? 0 : current

  return (
    <div className="bg-navy-900 border border-navy-700 rounded-lg px-4 py-3">
      <div className="flex items-center gap-0">
        {STEPS.map((step, i) => {
          const idx = ORDER.indexOf(step.key)
          const done = idx < resolved
          const active = idx === resolved
          const pending = idx > resolved

          return (
            <div key={step.key} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center gap-1">
                <div className={clsx(
                  'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors duration-500 border-2 flex-shrink-0',
                  done ? 'bg-emerald-700 border-emerald-500 text-white' :
                  active ? 'bg-blue-700 border-blue-400 text-white animate-pulse-slow' :
                  'bg-navy-800 border-navy-600 text-slate-500'
                )}>
                  {done ? '✓' : i + 1}
                </div>
                <span className={clsx(
                  'text-[9px] font-medium text-center leading-tight hidden sm:block',
                  done ? 'text-emerald-400' : active ? 'text-blue-300' : 'text-slate-600'
                )}>
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={clsx(
                  'flex-1 h-0.5 mx-1 transition-colors duration-500',
                  done ? 'bg-emerald-700' : 'bg-navy-700'
                )} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
