import { Check, ChevronDown, X } from 'lucide-react'
import { useId, useRef, useState, type KeyboardEvent } from 'react'

export interface ComboOption {
  value: string
  label: string
  /** Secondary text shown under the label in the list. */
  hint?: string
}

/**
 * Multi-select typeahead. Type to filter, pick several, selections appear
 * below as chips with an ✕. The ✕ inside the box clears everything.
 * Used for the pipeline's position filter and the apply form's qualifications.
 */
export function MultiCombobox({
  id,
  options,
  value,
  onChange,
  placeholder = 'Type to search…',
  invalid,
  describedBy,
}: {
  id?: string
  options: ComboOption[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  invalid?: boolean
  describedBy?: string
}) {
  const autoId = useId()
  const inputId = id ?? autoId
  const listId = `${inputId}-list`
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const q = query.trim().toLowerCase()
  const filtered = options.filter((o) => !q || o.label.toLowerCase().includes(q) || o.hint?.toLowerCase().includes(q))
  const selected = value.map((v) => options.find((o) => o.value === v)).filter((o): o is ComboOption => !!o)

  function toggle(v: string) {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])
    setQuery('')
    inputRef.current?.focus()
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActive((a) => Math.min(a + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      if (open && filtered[active]) {
        e.preventDefault()
        toggle(filtered[active].value)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    } else if (e.key === 'Backspace' && !query && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div
      className="space-y-2"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false)
      }}
    >
      <div className="relative">
        <div
          className={`flex items-center rounded-lg bg-white ring-1 ring-inset focus-within:ring-2 focus-within:ring-brand-600 ${invalid ? 'ring-red-500' : 'ring-stone-300'}`}
        >
          <input
            ref={inputRef}
            id={inputId}
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            aria-activedescendant={open && filtered[active] ? `${listId}-${active}` : undefined}
            autoComplete="off"
            value={query}
            placeholder={value.length ? `${value.length} selected · type to add` : placeholder}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
            onKeyDown={onKeyDown}
            className="min-w-0 flex-1 rounded-lg border-0 bg-transparent px-3 py-2.5 text-base text-stone-900 placeholder:text-stone-400 focus:outline-none sm:text-sm"
          />
          {value.length > 0 && (
            <button
              type="button"
              aria-label="Clear all"
              onClick={() => {
                onChange([])
                setQuery('')
                inputRef.current?.focus()
              }}
              className="grid size-8 place-items-center rounded text-stone-400 hover:text-stone-700"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="button"
            tabIndex={-1}
            aria-label={open ? 'Close list' : 'Open list'}
            onClick={() => {
              setOpen((o) => !o)
              inputRef.current?.focus()
            }}
            className="grid size-8 place-items-center pr-1 text-stone-400"
          >
            <ChevronDown size={16} />
          </button>
        </div>

        {open && (
          <ul
            id={listId}
            role="listbox"
            aria-multiselectable="true"
            className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl bg-white py-1 shadow-lg ring-1 ring-stone-200"
          >
            {filtered.length === 0 && <li className="px-3 py-2 text-sm text-stone-500">No matches</li>}
            {filtered.map((o, i) => {
              const isSelected = value.includes(o.value)
              return (
                <li
                  key={o.value}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => toggle(o.value)}
                  className={`flex cursor-pointer items-start gap-2 px-3 py-2 text-sm ${i === active ? 'bg-stone-100' : ''}`}
                >
                  <span className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded border ${isSelected ? 'border-brand-600 bg-brand-600 text-white' : 'border-stone-300'}`}>
                    {isSelected && <Check size={12} />}
                  </span>
                  <span>
                    <span className="block text-stone-900">{o.label}</span>
                    {o.hint && <span className="block text-xs text-stone-500">{o.hint}</span>}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Selected">
          {selected.map((o) => (
            <li key={o.value} className="inline-flex items-center gap-1 rounded-full bg-brand-50 py-0.5 pr-1 pl-2.5 text-sm text-brand-700 ring-1 ring-brand-100">
              {o.label}
              <button
                type="button"
                aria-label={`Remove ${o.label}`}
                onClick={() => toggle(o.value)}
                className="grid size-5 place-items-center rounded-full hover:bg-brand-100"
              >
                <X size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
