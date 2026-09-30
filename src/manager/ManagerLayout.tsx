import {
  Baby,
  CalendarDays,
  ClipboardCheck,
  House,
  MessageCircle,
  Receipt,
  UserPlus,
  Users,
} from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { ActionsProvider } from './ActionsProvider'
import { useManagerData } from './useManagerData'

// A stand-in for the Famly app shell, so the prototype reads as "inside Famly".
// Only Recruitment (and Staff, where hires land) are part of this prototype.

const FAKE_NAV = [
  { icon: House, label: 'Home' },
  { icon: Baby, label: 'Children' },
  { icon: ClipboardCheck, label: 'Attendance' },
  { icon: MessageCircle, label: 'Messages' },
  { icon: CalendarDays, label: 'Rota' },
  { icon: Receipt, label: 'Invoicing' },
]

const side = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-brand-50 font-medium text-brand-700' : 'text-stone-700 hover:bg-stone-100'}`

const tab = ({ isActive }: { isActive: boolean }) =>
  `border-b-2 px-1 pb-2.5 text-sm whitespace-nowrap ${isActive ? 'border-brand-600 font-medium text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-800'}`

export function ManagerLayout() {
  const { nursery } = useManagerData()
  const { pathname } = useLocation()
  const inStaff = pathname.startsWith('/manage/staff')

  return (
    <div className="flex min-h-[calc(100vh-30px)]">
      <aside className="hidden w-56 shrink-0 border-r border-stone-200 bg-white p-3 lg:block">
        <div className="mb-4 px-3 pt-2">
          <p className="text-lg font-bold text-brand-600">famly</p>
          <p className="truncate text-sm text-stone-600">{nursery.name}</p>
        </div>
        <nav className="space-y-0.5">
          {FAKE_NAV.map(({ icon: Icon, label }) => (
            <span key={label} className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-stone-400" title="Not part of this prototype">
              <Icon size={18} /> {label}
            </span>
          ))}
          <NavLink to="/manage/staff" className={side}>
            <Users size={18} /> Staff
          </NavLink>
          <NavLink to="/manage" className={({ isActive }) => side({ isActive: isActive && !inStaff })}>
            <UserPlus size={18} /> Recruitment
          </NavLink>
        </nav>
        <div className="mt-6 border-t border-stone-200 px-3 pt-4 text-sm">
          <p className="font-medium">Priya Shah</p>
          <p className="text-stone-500">Nursery manager</p>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="border-b border-stone-200 bg-white px-4 pt-4 sm:px-6">
          <div className="flex items-baseline justify-between gap-4">
            <h1 className="text-xl font-semibold">Recruitment</h1>
            <span className="truncate text-sm text-stone-500 lg:hidden">{nursery.name} · Priya Shah</span>
          </div>
          <nav className="mt-3 flex gap-5 overflow-x-auto">
            <NavLink to="/manage" end className={tab}>
              Overview
            </NavLink>
            <NavLink to="/manage/applicants" className={tab}>
              Applicants
            </NavLink>
            <NavLink to="/manage/staff" className={tab}>
              Staff records
            </NavLink>
          </nav>
        </header>
        <main className="px-4 py-5 sm:px-6">
          <ActionsProvider>
            <Outlet />
          </ActionsProvider>
        </main>
      </div>
    </div>
  )
}
