import { Outlet } from 'react-router'

/** Public side: phone-first, single column. */
export function PortalLayout() {
  return (
    <div className="min-h-[calc(100vh-30px)] bg-stone-50">
      <div className="mx-auto max-w-xl pb-24">
        <Outlet />
      </div>
      <footer className="pb-8 text-center text-xs text-stone-400">Recruitment powered by Famly</footer>
    </div>
  )
}

export function NurseryHeader({ name, area }: { name: string; area?: string }) {
  return (
    <header className="bg-brand-600 px-4 pt-6 pb-5 text-white sm:rounded-b-2xl">
      <div className="flex items-center gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-full bg-white/15 text-lg font-semibold">
          {name.charAt(0)}
        </div>
        <div>
          <p className="text-lg leading-tight font-semibold">{name}</p>
          {area && <p className="text-sm text-white/80">{area}</p>}
        </div>
      </div>
    </header>
  )
}
