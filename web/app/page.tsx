import { VaultCreator } from "../components/VaultCreator"

export default function HomePage() {
  return (
    <section className="flex flex-col items-start gap-10 py-12 lg:flex-row lg:items-center">
      <div className="flex-1 space-y-6">
        <span className="inline-flex items-center rounded-full border border-primary-600/40 bg-primary-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-100">
          Flow Forte Actions + Scheduled Transactions
        </span>
        <h1 className="text-4xl font-semibold text-white sm:text-5xl">
          Automated earthquake relief powered by Flow
        </h1>
        <p className="text-lg text-slate-300">
          DisasterVault combines Cadence smart contracts, Flow Actions, and GPT-4 verification to send funds to the
          Red Cross minutes after catastrophic earthquakes strike. Deposit once, then let the chain respond while you
          sleep.
        </p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Scheduled monitoring every 6 hours
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Oracle-backed USGS feed
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            GPT-4 severity filter
          </div>
        </div>
      </div>
      <div className="flex-1">
        <VaultCreator />
      </div>
    </section>
  )
}
