import { FileText } from 'lucide-react'
import type { CvFile } from '../domain/types'
import { Popover } from '../ui/Popover'

const size = (cv: CvFile) => `${Math.max(1, Math.round(cv.sizeBytes / 1024))} KB`

/** The candidate's CV, one tap away on the card and in the panel. */
export function CvChip({ cv, full }: { cv: CvFile; full?: boolean }) {
  return (
    <Popover
      fixed
      label={`CV: ${cv.name}`}
      button={
        <>
          <FileText size={full ? 14 : 13} aria-hidden className="shrink-0" />
          <span className="truncate">{full ? cv.name : 'CV'}</span>
          {full && <span className="shrink-0 text-xs text-stone-500">{size(cv)}</span>}
        </>
      }
      buttonClassName={`inline-flex max-w-full items-center gap-1.5 rounded-md text-brand-700 hover:underline ${full ? 'text-sm' : 'text-xs font-medium'}`}
      panelClassName="w-[min(18rem,calc(100vw-2rem))] p-3"
    >
      {() => (
        <div className="space-y-2 text-left text-sm">
          <p className="flex items-center gap-2 font-medium text-stone-900">
            <FileText size={16} className="shrink-0 text-brand-600" aria-hidden />
            <span className="truncate">{cv.name}</span>
          </p>
          <p className="text-xs text-stone-500">
            {cv.type === 'application/pdf' ? 'PDF' : 'Word document'} · {size(cv)}
          </p>
          <p className="text-xs text-stone-500">Prototype: only the file name is kept. In Famly this opens the CV in a viewer.</p>
        </div>
      )}
    </Popover>
  )
}
