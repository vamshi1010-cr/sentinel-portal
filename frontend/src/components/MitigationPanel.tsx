import clsx from 'clsx'
import type { IncidentState } from '../types'

interface Props {
  state: IncidentState
}

const ACTIONS = [
  {
    label: 'Rate limiting policy activated',
    states: ['MITIGATION_ACTIVE', 'RECOVERING', 'RESOLVED'],
  },
  {
    label: 'Suspicious traffic patterns filtered',
    states: ['MITIGATION_ACTIVE', 'RECOVERING', 'RESOLVED'],
  },
  {
    label: 'Traffic protection layer engaged',
    states: ['MITIGATION_ACTIVE', 'RECOVERING', 'RESOLVED'],
  },
  {
    label: 'Application connection limits enforced',
    states: ['RECOVERING', 'RESOLVED'],
  },
  {
    label: 'Service health monitoring intensified',
    states: ['MITIGATION_ACTIVE', 'RECOVERING', 'RESOLVED'],
  },
  {
    label: 'Load distribution rebalanced',
    states: ['RECOVERING', 'RESOLVED'],
  },
  {
    label: 'Service availability restored',
    states: ['RESOLVED'],
  },
]

export function MitigationPanel({ state }: Props) {
  const isMitigating = ['INCIDENT_DECLARED', 'MITIGATION_ACTIVE', 'RECOVERING', 'RESOLVED'].includes(state)

  return (
    <div className="bg-navy-900 border border-navy-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Response Actions</h3>
        {isMitigating ? (
          <span className="text-[10px] px-2 py-0.5 rounded bg-orange-900/50 text-orange-300 font-semibold uppercase">
            Automated Response
          </span>
        ) : (
          <span className="text-[10px] px-2 py-0.5 rounded bg-navy-800 text-slate-500 uppercase">
            Standby
          </span>
        )}
      </div>

      {!isMitigating && (
        <p className="text-xs text-slate-500 italic">
          Automated response will activate upon incident declaration.
        </p>
      )}

      <div className="space-y-2">
        {ACTIONS.map((action) => {
          const active = action.states.includes(state)
          return (
            <div key={action.label} className={clsx(
              'flex items-center gap-3 text-xs rounded px-3 py-2 transition-all duration-700',
              active ? 'bg-emerald-950/30 border border-emerald-900' : 'bg-navy-800/50 border border-navy-800'
            )}>
              <span className={clsx(
                'flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold',
                active ? 'bg-emerald-700 text-white' : 'bg-navy-700 text-slate-500'
              )}>
                {active ? '✓' : '○'}
              </span>
              <span className={active ? 'text-slate-200' : 'text-slate-500'}>
                {action.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
