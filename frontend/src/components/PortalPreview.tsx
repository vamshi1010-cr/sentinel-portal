import clsx from 'clsx'
import type { IncidentState } from '../types'

interface Props {
  state: IncidentState
  availability: number
  latencyMs: number
}

function portalStatus(state: IncidentState, availability: number) {
  if (['NORMAL', 'MONITORING'].includes(state)) return 'operational'
  if (['ANOMALY_DETECTED', 'INVESTIGATING'].includes(state)) return 'degraded-minor'
  if (['INCIDENT_DECLARED', 'MITIGATION_ACTIVE'].includes(state)) return 'degraded-major'
  if (state === 'RECOVERING') return 'recovering'
  return 'operational'
}

const PAGES = ['Dashboard', 'Announcements', 'Courses', 'Results', 'Library', 'Profile']

export function PortalPreview({ state, availability, latencyMs }: Props) {
  const status = portalStatus(state, availability)

  return (
    <div className="bg-navy-900 border border-navy-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Campus Services Portal</h3>
        <span className="text-[10px] text-slate-600 bg-navy-800 px-2 py-0.5 rounded font-mono">
          SIMULATED PORTAL
        </span>
      </div>

      {/* Mock browser frame */}
      <div className="border border-navy-600 rounded-lg overflow-hidden">
        {/* Browser chrome */}
        <div className="bg-navy-800 px-3 py-2 flex items-center gap-2 border-b border-navy-700">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
          </div>
          <div className="flex-1 bg-navy-900 rounded px-2 py-0.5 text-[10px] text-slate-500 font-mono truncate">
            campus.university.edu/portal
          </div>
        </div>

        {/* Portal content */}
        <div className="bg-slate-900 p-0">
          {/* Portal nav */}
          <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
            <span className="text-sm font-semibold text-white">🎓 Campus Portal</span>
            <span className="text-xs text-slate-400">Student: J. Doe</span>
          </div>

          <div className="flex min-h-[140px]">
            {/* Sidebar */}
            <div className="bg-slate-800 w-32 flex-shrink-0 p-2 border-r border-slate-700">
              {PAGES.map((p, i) => (
                <div
                  key={p}
                  className={clsx(
                    'text-xs px-2 py-1.5 rounded mb-0.5 cursor-default',
                    i === 0
                      ? 'bg-blue-800 text-white'
                      : status === 'degraded-major'
                      ? 'text-slate-500 opacity-60'
                      : 'text-slate-300 hover:bg-slate-700'
                  )}
                >
                  {p}
                </div>
              ))}
            </div>

            {/* Main content */}
            <div className="flex-1 p-4">
              {status === 'operational' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs text-emerald-300 font-medium">All systems operational</span>
                  </div>
                  <p className="text-xs text-slate-300">Welcome back, Student. Your dashboard has loaded successfully.</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['3 New Notices', 'Schedule: OK', 'Results: Ready', 'Library: Online'].map(item => (
                      <div key={item} className="bg-slate-700 rounded px-2 py-1.5 text-[10px] text-slate-300">{item}</div>
                    ))}
                  </div>
                </div>
              )}

              {status === 'degraded-minor' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-xs text-amber-300 font-medium">Some services may be slow</span>
                  </div>
                  <p className="text-xs text-slate-400">Elevated response times detected. Service team has been notified.</p>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Availability: {availability.toFixed(1)}% · Latency: {latencyMs >= 1000 ? `${(latencyMs/1000).toFixed(1)}s` : `${Math.round(latencyMs)}ms`}
                  </div>
                </div>
              )}

              {status === 'degraded-major' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                    <span className="text-xs text-red-300 font-medium">Service disruption in progress</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    ⚠ Some services are experiencing elevated response times. Our team is working to restore normal operation.
                  </p>
                  <div className="bg-red-950/40 border border-red-900 rounded px-2 py-1.5 text-[10px] text-red-300">
                    Availability: {availability.toFixed(1)}% · Response time: {latencyMs >= 1000 ? `${(latencyMs/1000).toFixed(1)}s` : `${Math.round(latencyMs)}ms`}
                  </div>
                </div>
              )}

              {status === 'recovering' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                    <span className="text-xs text-sky-300 font-medium">Service restoration in progress</span>
                  </div>
                  <p className="text-xs text-slate-400">Systems are recovering. Response times improving.</p>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Availability: {availability.toFixed(1)}% · Latency: {latencyMs >= 1000 ? `${(latencyMs/1000).toFixed(1)}s` : `${Math.round(latencyMs)}ms`}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
