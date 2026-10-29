import clsx from 'clsx'
import type { ScenarioInfo } from '../types'

interface Props {
  scenarios: ScenarioInfo[]
  currentScenarioId: string
  isPaused: boolean
  speed: number
  onPause: () => void
  onResume: () => void
  onRestart: () => void
  onScenario: (id: string) => void
  onSpeed: (m: number) => void
}

const SPEEDS = [
  { label: '0.5×', value: 0.5 },
  { label: '1×', value: 1 },
  { label: '2×', value: 2 },
  { label: '4×', value: 4 },
]

export function DemoControls({
  scenarios,
  currentScenarioId,
  isPaused,
  speed,
  onPause,
  onResume,
  onRestart,
  onScenario,
  onSpeed,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 bg-navy-900 border border-navy-700 rounded-lg px-4 py-2.5">
      {/* Label */}
      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Demo Mode</span>

      {/* Scenario selector */}
      <select
        value={currentScenarioId}
        onChange={(e) => onScenario(e.target.value)}
        className="text-xs bg-navy-800 border border-navy-600 text-slate-300 rounded px-2 py-1 outline-none focus:border-blue-600"
      >
        {scenarios.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      {/* Playback controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={isPaused ? onResume : onPause}
          className={clsx(
            'text-xs px-3 py-1 rounded border font-medium transition-colors',
            isPaused
              ? 'border-blue-600 text-blue-300 hover:bg-blue-900/30'
              : 'border-navy-600 text-slate-400 hover:border-slate-500'
          )}
        >
          {isPaused ? '▶ Resume' : '⏸ Pause'}
        </button>
        <button
          onClick={onRestart}
          className="text-xs px-3 py-1 rounded border border-navy-600 text-slate-400 hover:border-slate-500 font-medium transition-colors"
        >
          ↺ Replay
        </button>
      </div>

      {/* Speed */}
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-slate-500">Speed:</span>
        {SPEEDS.map((s) => (
          <button
            key={s.value}
            onClick={() => onSpeed(s.value)}
            className={clsx(
              'text-[10px] px-2 py-0.5 rounded transition-colors',
              Math.abs(speed - s.value) < 0.01
                ? 'bg-blue-700 text-white'
                : 'text-slate-500 hover:text-slate-300'
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
