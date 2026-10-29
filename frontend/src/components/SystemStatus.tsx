import clsx from 'clsx'
import type { IncidentState } from '../types'

interface Props {
  state: IncidentState
  classification: string
  classificationColor: 'neutral' | 'green' | 'amber' | 'red'
  threatScore: number
  wsStatus: 'connected' | 'disconnected' | 'error'
}

const STATE_LABELS: Record<string, string> = {
  NORMAL: 'Normal Operation',
  MONITORING: 'Monitoring',
  ANOMALY_DETECTED: 'Anomaly Detected',
  INVESTIGATING: 'Investigating',
  SUSPICIOUS_ACTIVITY: 'Suspicious Activity',
  INCIDENT_DECLARED: 'Incident Declared',
  MITIGATION_ACTIVE: 'Mitigation Active',
  RECOVERING: 'Recovering',
  RESOLVED: 'Resolved',
}

const STATE_COLORS: Record<string, string> = {
  NORMAL: 'text-emerald-400',
  MONITORING: 'text-blue-400',
  ANOMALY_DETECTED: 'text-amber-400',
  INVESTIGATING: 'text-amber-400',
  SUSPICIOUS_ACTIVITY: 'text-orange-400',
  INCIDENT_DECLARED: 'text-red-400',
  MITIGATION_ACTIVE: 'text-orange-400',
  RECOVERING: 'text-sky-400',
  RESOLVED: 'text-emerald-400',
}

const STATE_DOT: Record<string, string> = {
  NORMAL: 'bg-emerald-400',
  MONITORING: 'bg-blue-400',
  ANOMALY_DETECTED: 'bg-amber-400',
  INVESTIGATING: 'bg-amber-400',
  SUSPICIOUS_ACTIVITY: 'bg-orange-400',
  INCIDENT_DECLARED: 'bg-red-400',
  MITIGATION_ACTIVE: 'bg-orange-400',
  RECOVERING: 'bg-sky-400',
  RESOLVED: 'bg-emerald-400',
}

export function SystemStatus({ state, classification, classificationColor, threatScore, wsStatus }: Props) {
  const label = STATE_LABELS[state] ?? state
  const color = STATE_COLORS[state] ?? 'text-slate-400'
  const dot = STATE_DOT[state] ?? 'bg-slate-400'

  const isAlert = ['INCIDENT_DECLARED', 'MITIGATION_ACTIVE'].includes(state)

  return (
    <div className={clsx(
      'flex items-center gap-4 px-4 py-2 rounded-lg border text-sm font-medium',
      isAlert
        ? 'border-red-800 bg-red-950/30'
        : state === 'RESOLVED'
        ? 'border-emerald-800 bg-emerald-950/20'
        : 'border-navy-700 bg-navy-800/50'
    )}>
      {/* WS connection dot */}
      <span className={clsx(
        'w-2 h-2 rounded-full flex-shrink-0',
        wsStatus === 'connected' ? 'bg-emerald-400' : 'bg-slate-500'
      )} />

      {/* State dot (animated when incident) */}
      <span className={clsx(
        'w-2 h-2 rounded-full flex-shrink-0',
        dot,
        isAlert && 'animate-pulse'
      )} />

      <span className={clsx('font-semibold', color)}>{label}</span>

      {state !== 'NORMAL' && state !== 'MONITORING' && (
        <span className="hidden sm:block text-slate-400 text-xs border-l border-navy-600 pl-4 truncate max-w-[320px]">
          {classification}
        </span>
      )}

      <span className={clsx(
        'ml-auto text-xs px-2 py-0.5 rounded font-mono',
        threatScore >= 75 ? 'bg-red-900/60 text-red-300' :
        threatScore >= 45 ? 'bg-amber-900/60 text-amber-300' :
        'bg-navy-700 text-slate-400'
      )}>
        THREAT {threatScore}/100
      </span>
    </div>
  )
}
