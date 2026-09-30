/** A row of equal-width single-choice buttons (radio group). Used on the apply form and the interview dialog. */
export function ChoiceGroup<T extends string>({
  id,
  legend,
  options,
  value,
  onChange,
  error,
}: {
  id: string
  legend: string
  options: { value: T; label: string }[]
  value: T | null
  onChange: (value: T) => void
  error?: string
}) {
  return (
    <fieldset className="space-y-1.5">
      <legend className="text-sm font-medium text-stone-800">{legend}</legend>
      <div className="grid gap-2 pt-1.5" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
        {options.map((o, i) => (
          <label
            key={o.value}
            className={`flex h-12 cursor-pointer items-center justify-center rounded-lg bg-white text-sm ring-1 ring-inset has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-600 ${value === o.value ? 'font-medium ring-2 ring-brand-600' : error ? 'ring-red-400' : 'ring-stone-300'}`}
          >
            <input
              id={i === 0 ? id : undefined}
              type="radio"
              name={id}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </fieldset>
  )
}
