export type EarthquakeEvent = {
  id: string
  magnitude: number
  place: string
  time: string
}

export async function fetchRecentEarthquakes(): Promise<EarthquakeEvent[]> {
  const since = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  const url = new URL("https://earthquake.usgs.gov/fdsnws/event/1/query")
  url.searchParams.set("format", "geojson")
  url.searchParams.set("orderby", "time")
  url.searchParams.set("starttime", since)
  url.searchParams.set("minmagnitude", "6")

  const response = await fetch(url, { next: { revalidate: 60 } })
  if (!response.ok) {
    throw new Error(`Failed to fetch earthquakes: ${response.status}`)
  }
  const data = (await response.json()) as {
    features: Array<{ id: string; properties: { mag: number; place: string; time: number } }>
  }
  return data.features.map((feature) => ({
    id: feature.id,
    magnitude: feature.properties.mag,
    place: feature.properties.place,
    time: new Date(feature.properties.time).toISOString()
  }))
}

export type VaultStatus = {
  vaultId: number
  balance: number
  threshold: number
  maxDonation: number
  recipient: string
  donations: Array<{
    sourceId: string
    magnitude: number
    amount: number
    location: string
    timestamp: string
  }>
}

export async function getVaultStatus(): Promise<VaultStatus | null> {
  const response = await fetch("/api/vault-status", { cache: "no-store" })
  if (!response.ok) return null
  return (await response.json()) as VaultStatus | null
}


