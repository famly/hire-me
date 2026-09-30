import { MoreHorizontal } from 'lucide-react'
import type { ReactNode } from 'react'
import { Popover } from './Popover'

export interface MenuItem {
  label: string
  onSelect: () => void
  icon?: ReactNode
  danger?: boolean
}

/** Ellipsis quick-actions menu, built on Popover. */
export function Menu({ items, label = 'More actions' }: { items: MenuItem[]; label?: string }) {
  return (
    <Popover
      label={label}
      panelRole="menu"
      button={<MoreHorizontal size={18} />}
      buttonClassName="grid size-8 place-items-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-800"
      panelClassName="w-52 py-1"
    >
      {(close) =>
        items.map((item) => (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            onClick={() => {
              close()
              item.onSelect()
            }}
            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-stone-50 ${item.danger ? 'text-red-700' : 'text-stone-800'}`}
          >
            {item.icon}
            {item.label}
          </button>
        ))
      }
    </Popover>
  )
}
