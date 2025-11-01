import { DashboardOverview } from "../../components/DashboardOverview"

export const metadata = {
  title: "Dashboard · DisasterVault"
}

// Force dynamic rendering to avoid build-time errors with blockchain features
export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  return (
    <section className="py-12">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold text-white">Vault dashboard</h1>
        <p className="max-w-2xl text-slate-300">
          Monitor your vault balance, review recent donations, and inspect the earthquakes that triggered the
          scheduled Flow actions. Data refreshes automatically every minute.
        </p>
      </div>
      <div className="mt-10">
        <DashboardOverview />
      </div>
    </section>
  )
}
