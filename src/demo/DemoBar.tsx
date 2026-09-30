import { FastForward, RotateCcw } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router'
import { DAY } from '../domain/time'
import { useStore } from '../store/store'

// Prototype-only chrome: lets reviewers switch sides without logging in.

const tab = ({ isActive }: { isActive: boolean }) =>
  `rounded px-2 py-1 ${isActive ? 'bg-white/15 text-white' : 'text-stone-300 hover:text-white'}`

export function DemoBar() {
  const clockOffset = useStore((s) => s.clockOffset)
  const fastForward = useStore((s) => s.fastForward)
  const reset = useStore((s) => s.reset)
  const navigate = useNavigate()
  const days = Math.round(clockOffset / DAY)

  return (
    <div className="sticky top-0 z-40 bg-stone-900 text-xs text-stone-300">
      <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-3 py-1.5 whitespace-nowrap">
        <NavLink to="/" end className="mr-2 font-semibold text-white">
          Prototype
        </NavLink>
        <NavLink to="/n/oak-tree" className={tab}>
          Job seeker
        </NavLink>
        <NavLink to="/manage" className={tab}>
          Manager
        </NavLink>
        <span className="ml-auto" />
        {days > 0 && <span className="mr-1 text-amber-300">Clock +{days}d</span>}
        <button
          type="button"
          onClick={() => fastForward(DAY)}
          className="inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-white/10 hover:text-white"
          title="Move the demo clock forward one day"
        >
          <FastForward size={14} /> +1 day
        </button>
        <button
          type="button"
          onClick={() => {
            reset()
            navigate('/')
          }}
          className="inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-white/10 hover:text-white"
          title="Restore the seed data"
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>
    </div>
  )
}
