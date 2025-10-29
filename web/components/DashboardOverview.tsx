import { Suspense } from "react"
import { Card, CardDescription, CardTitle } from "./ui/card"
import { fetchRecentEarthquakes, getVaultStatus } from "../lib/flow"

export async function DashboardOverview() {
  const [vault, earthquakes] = await Promise.all([getVaultStatus(), fetchRecentEarthquakes()])
  const lastDonation = vault?.donations.at(-1) ?? null

  if (!vault) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>No vault found</CardTitle>
          <CardDescription>Create a vault to start automating your donations.</CardDescription>
          <p className="mt-6 text-sm text-slate-300">
            Head to the create flow to deposit FLOW and register your trigger parameters. Once saved, the
            dashboard will track balances, donation executions, and oracle updates in real time.
          </p>
        </Card>
        <Card>
          <CardTitle>Recent earthquakes</CardTitle>
          <CardDescription>Live data pulled from the USGS feed every few minutes.</CardDescription>
          <Suspense fallback={<p className="mt-6 text-sm text-slate-400">Loading events…</p>}>
            <ul className="mt-6 space-y-4">
              {earthquakes.length === 0 && (
                <li className="text-sm text-slate-400">No events recorded in the last six hours.</li>
              )}
              {earthquakes.map((event) => (
                <li key={event.id} className="rounded-lg border border-white/10 bg-black/40 p-4">
                  <p className="text-sm font-semibold text-white">Magnitude {event.magnitude.toFixed(1)}</p>
                  <p className="text-xs text-slate-300">{event.place}</p>
                  <p className="text-xs text-slate-500">{new Date(event.time).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          </Suspense>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
        <Card>
          <CardTitle>Vault #{vault.vaultId}</CardTitle>
          <CardDescription>Your automated disaster response vault on Flow Testnet.</CardDescription>
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm text-slate-200">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Current balance</dt>
              <dd className="mt-1 text-2xl font-semibold">{vault.balance.toFixed(2)} FLOW</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Trigger threshold</dt>
              <dd className="mt-1 text-2xl font-semibold">M {vault.threshold.toFixed(1)}+</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Max donation</dt>
              <dd className="mt-1 text-2xl font-semibold">{vault.maxDonation.toFixed(2)} FLOW</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Recipient</dt>
              <dd className="mt-1 text-base font-semibold text-primary-100">{vault.recipient}</dd>
            </div>
          </dl>
          {lastDonation ? (
            <div className="mt-6 rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
              <p className="font-semibold">Recent donation executed</p>
              <p className="mt-1">Magnitude {lastDonation.magnitude.toFixed(1)} — {lastDonation.location}</p>
              <p className="text-xs text-emerald-200/80">
                {lastDonation.amount.toFixed(2)} FLOW · {new Date(lastDonation.timestamp).toLocaleString()}
              </p>
            </div>
          ) : (
            <p className="mt-6 text-sm text-slate-400">No donations executed yet.</p>
          )}
        </Card>

        <Card>
          <CardTitle>Recent earthquakes</CardTitle>
          <CardDescription>Live data pulled from the USGS feed every few minutes.</CardDescription>
          <Suspense fallback={<p className="mt-6 text-sm text-slate-400">Loading events…</p>}>
            <ul className="mt-6 space-y-4">
              {earthquakes.length === 0 && (
                <li className="text-sm text-slate-400">No events recorded in the last six hours.</li>
              )}
              {earthquakes.map((event) => (
                <li key={event.id} className="rounded-lg border border-white/10 bg-black/40 p-4">
                  <p className="text-sm font-semibold text-white">Magnitude {event.magnitude.toFixed(1)}</p>
                  <p className="text-xs text-slate-300">{event.place}</p>
                  <p className="text-xs text-slate-500">{new Date(event.time).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          </Suspense>
        </Card>
      </div>

      <Card>
        <CardTitle>Donation history</CardTitle>
        <CardDescription>Chronological log of automated disbursements executed by your vault.</CardDescription>
        {vault.donations.length === 0 ? (
          <p className="mt-6 text-sm text-slate-400">No donations recorded yet.</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm text-slate-200">
              <thead className="text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="pb-2">Timestamp</th>
                  <th className="pb-2">Magnitude</th>
                  <th className="pb-2">Location</th>
                  <th className="pb-2 text-right">Amount (FLOW)</th>
                </tr>
              </thead>
              <tbody>
                {[...vault.donations]
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((donation) => (
                    <tr key={`${donation.sourceId}-${donation.timestamp}`} className="border-t border-white/5">
                      <td className="py-3 text-xs text-slate-300">{new Date(donation.timestamp).toLocaleString()}</td>
                      <td className="py-3 font-semibold text-white">{donation.magnitude.toFixed(1)}</td>
                      <td className="py-3 text-xs text-slate-300">{donation.location}</td>
                      <td className="py-3 text-right font-semibold text-emerald-200">{donation.amount.toFixed(2)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
