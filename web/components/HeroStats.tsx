import { fetchRecentEarthquakes } from "../lib/server-data"
import { Card, CardDescription, CardTitle } from "./ui/card"

export async function HeroStats() {
  let earthquakes = [] as Awaited<ReturnType<typeof fetchRecentEarthquakes>>
  let errored = false
  try {
    earthquakes = await fetchRecentEarthquakes()
  } catch (error) {
    console.error("Failed to load earthquake stats", error)
    errored = true
  }
  const totalEvents = earthquakes.length
  const strongest = earthquakes.reduce<null | (typeof earthquakes)[number]>((current, event) => {
    if (!current) return event
    return event.magnitude > current.magnitude ? event : current
  }, null)
  const latest = earthquakes[0] ?? null

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="bg-black/50">
        <CardTitle>Live M6+ quakes</CardTitle>
        <CardDescription>Events detected by the USGS feed in the last six hours.</CardDescription>
        <p className="mt-6 text-3xl font-semibold text-white">{errored ? "—" : totalEvents}</p>
        <p className="text-xs uppercase tracking-wide text-slate-400">
          {errored ? "Refresh to retry" : "Worldwide"}
        </p>
      </Card>

      <Card className="bg-black/50">
        <CardTitle>Strongest magnitude</CardTitle>
        <CardDescription>Measured across the recent window powering the oracle.</CardDescription>
        <p className="mt-6 text-3xl font-semibold text-white">
          {strongest ? strongest.magnitude.toFixed(1) : "—"}
        </p>
        <p className="text-xs uppercase tracking-wide text-slate-400">
          {strongest ? strongest.place : "Awaiting events"}
        </p>
      </Card>

      <Card className="bg-black/50">
        <CardTitle>Latest detection</CardTitle>
        <CardDescription>Timestamp of the freshest qualifying earthquake.</CardDescription>
        <p className="mt-6 text-3xl font-semibold text-white">
          {latest ? new Date(latest.time).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : "—"}
        </p>
        <p className="text-xs uppercase tracking-wide text-slate-400">
          {latest ? new Date(latest.time).toLocaleDateString() : "No events yet"}
        </p>
      </Card>
    </div>
  )
}
