import clsx from 'clsx'
import type { TimelineEvent, IncidentState } from '../types'

interface Props {
  events: TimelineEvent[]
}

const STATE_COLORS: Partial<Record<IncidentState, string>> = {
  NORMAL: 'border-l-emerald-600 text-emerald-300',
  MONITORING: 'border-l-blue-600 text-blue-300',
  ANOMALY_DETECTED: 'border-l-amber-600 text-amber-300',
  INVESTIGATING: 'border-l-amber-500 text-amber-300',
  INCIDENT_DECLARED: 'border-l-red-600 text-red-300',
  MITIGATION_ACTIVE: 'border-l-orange-500 text-orange-300',
  RECOVERING: 'border-l-sky-500 text-sky-300',
  RESOLVED: 'border-l-emerald-500 text-emerald-300',
}

function fmtTime(ts: number) {
  const d = new Date(ts * 1000)
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function IncidentTimeline({ events }: Props) {
  const sorted = [...events].sort((a, b) => a.time - b.time)

  return (
    <div className="bg-navy-900 border border-navy-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Incident Timeline</h3>
        <span className="text-[10px] text-slate-600 bg-navy-800 px-2 py-0.5 rounded font-mono uppercase">
          Controlled Simulation
        </span>
      </div>

      {sorted.length === 0 ? (
        <p className="text-xs text-slate-500 italic">Awaiting first event…</p>
      ) : (
        <div className="space-y-0">
          {sorted.map((ev, i) => {
            const colorClass = STATE_COLORS[ev.state as IncidentState] ?? 'border-l-slate-600 text-slate-400'
            const [borderColor, textColor] = colorClass.split(' ')
            return (
              <div
                key={i}
                className={clsx(
                  'border-l-2 pl-3 py-2 animate-slide-in',
                  borderColor,
                  i < sorted.length - 1 && 'border-b border-b-navy-800'
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="font-mono text-[10px] text-slate-500 whitespace-nowrap pt-0.5 min-w-[60px]">
                    {fmtTime(ev.time)}
                  </span>
                  <div>
                    <span className={clsx('text-[10px] font-semibold uppercase tracking-wide', textColor)}>
                      {ev.phase}
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">{ev.message}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
