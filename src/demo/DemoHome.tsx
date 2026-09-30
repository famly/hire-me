import { ArrowRight, Briefcase, Smartphone } from 'lucide-react'
import { Link } from 'react-router'
import { Card } from '../ui/Card'

export function DemoHome() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
      <p className="text-sm font-medium text-brand-600">Famly · recruitment portal prototype</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">One page to apply. One board to hire from.</h1>
      <p className="mt-3 text-stone-600">
        Every nursery gets a public page where job seekers apply from a phone, with no account. The manager gets one
        hiring pipeline inside Famly, a board with a lane per stage where red only ever means "waiting too long for a
        reply", and a hire becomes a staff record without retyping.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link to="/n/oak-tree" className="group">
          <Card className="h-full p-5 transition group-hover:ring-brand-500">
            <Smartphone className="text-brand-600" />
            <h2 className="mt-3 font-semibold">Job seeker</h2>
            <p className="mt-1 text-sm text-stone-600">
              Oak Tree Nursery's public page. Best viewed narrow: use device mode or shrink the window.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-700">
              Open portal <ArrowRight size={14} />
            </span>
          </Card>
        </Link>
        <Link to="/manage" className="group">
          <Card className="h-full p-5 transition group-hover:ring-brand-500">
            <Briefcase className="text-brand-600" />
            <h2 className="mt-3 font-semibold">Nursery manager</h2>
            <p className="mt-1 text-sm text-stone-600">
              Signed in as Priya Shah, manager at Oak Tree Nursery, in the Recruitment section of Famly.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-700">
              Open Famly <ArrowRight size={14} />
            </span>
          </Card>
        </Link>
      </div>

      <section className="mt-10">
        <h2 className="text-sm font-semibold tracking-wide text-stone-500 uppercase">Suggested walkthrough</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-stone-700">
          <li>As a job seeker, apply for the Level 3 Practitioner role at Oak Tree. Keep the status link open in a tab.</li>
          <li>As the manager, open Hiring pipeline, find the new card in the New lane, and invite them to interview (click or drag). The status tab updates.</li>
          <li>Hire them, confirm the prefilled staff record, then mark the position filled and notify everyone else.</li>
          <li>Open Amira Khan: she has also applied to Willow House, in the same group.</li>
          <li>Marcus Bell has gone quiet (amber). Press "+1 day" to watch waits turn red, then open Marcus and mark him as lapsed.</li>
        </ol>
        <p className="mt-4 text-sm text-stone-500">
          Other public pages in the group: <Link className="underline" to="/n/willow-house">Willow House</Link> ·{' '}
          <Link className="underline" to="/n/birch-lane">Birch Lane Nursery</Link>. Data lives in your browser;
          "Reset" restores it.
        </p>
      </section>
    </main>
  )
}
