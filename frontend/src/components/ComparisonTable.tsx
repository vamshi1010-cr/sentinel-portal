import clsx from 'clsx'
import type { ComparisonData } from '../types'

interface Props {
  data: ComparisonData
}

const COLOR_MAP: Record<string, string> = {
  green: 'text-emerald-400 bg-emerald-950/30',
  amber: 'text-amber-400 bg-amber-950/30',
  red: 'text-red-400 bg-red-950/30',
  neutral: 'text-slate-400 bg-navy-800',
}

export function ComparisonTable({ data }: Props) {
  return (
    <div className="bg-navy-900 border border-navy-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Traffic-Only vs Multi-Signal Detection</h3>
          <p className="text-xs text-slate-500 mt-0.5">Research concept: why multi-signal correlation matters</p>
        </div>
        <span className="text-[10px] bg-navy-800 text-slate-400 px-2 py-0.5 rounded border border-navy-600 italic">
          {data.label}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-navy-700">
              <th className="text-left text-slate-400 font-semibold py-2 pr-4">Event Type</th>
              <th className="text-center text-slate-400 font-semibold py-2 px-4">Traffic-Only</th>
              <th className="text-center text-slate-400 font-semibold py-2 px-4">Multi-Signal</th>
              <th className="text-left text-slate-400 font-semibold py-2 pl-4 hidden md:table-cell">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-800">
            {data.rows.map((row) => (
              <tr key={row.event_type} className="hover:bg-navy-800/30 transition-colors">
                <td className="py-3 pr-4 text-slate-200 font-medium">{row.event_type}</td>
                <td className="py-3 px-4 text-center">
                  <span className={clsx(
                    'px-2 py-1 rounded text-[10px] font-semibold uppercase',
                    COLOR_MAP[row.traffic_only_color]
                  )}>
                    {row.traffic_only}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={clsx(
                    'px-2 py-1 rounded text-[10px] font-semibold uppercase',
                    COLOR_MAP[row.multi_signal_color]
                  )}>
                    {row.multi_signal}
                  </span>
                </td>
                <td className="py-3 pl-4 text-slate-500 hidden md:table-cell">{row.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-[10px] text-slate-600 italic">
        This table is a conceptual demonstration model. Results are illustrative only and have not been experimentally validated.
        Actual detection performance depends on implementation details, thresholds, and real-world traffic characteristics.
      </div>
    </div>
  )
}
