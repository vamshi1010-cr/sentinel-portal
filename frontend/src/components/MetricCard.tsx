import clsx from 'clsx'
import type { ReactNode } from 'react'

interface Props {
  title: string
  value: string | number
  unit?: string
  icon: ReactNode
  status?: 'normal' | 'warning' | 'critical' | 'good'
  subtitle?: string
}

const STATUS_COLORS = {
  normal: 'border-navy-700',
  warning: 'border-amber-700',
  critical: 'border-red-700',
  good: 'border-emerald-700',
}

const STATUS_VALUE_COLORS = {
  normal: 'text-white',
  warning: 'text-amber-300',
  critical: 'text-red-300',
  good: 'text-emerald-300',
}

export function MetricCard({ title, value, unit, icon, status = 'normal', subtitle }: Props) {
  return (
    <div className={clsx(
      'bg-navy-900 border rounded-lg p-4 flex flex-col gap-2 transition-colors duration-500',
      STATUS_COLORS[status]
    )}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        <span className="text-slate-500">{icon}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={clsx(
          'text-2xl font-bold font-mono tabular-nums transition-colors duration-500',
          STATUS_VALUE_COLORS[status]
        )}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {unit && <span className="text-slate-400 text-sm">{unit}</span>}
      </div>
      {subtitle && <span className="text-xs text-slate-500">{subtitle}</span>}
    </div>
  )
}
