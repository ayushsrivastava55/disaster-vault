"use server"

import "server-only"

export type VaultCreationPayload = {
  threshold: number
  maxDonation: number
  depositAmount: number
}

export async function createVault(payload: VaultCreationPayload) {
  // Placeholder server action. In production this would execute an FCL transaction
  // with the Cadence actions described in the PRD.
  console.log("createVault action invoked", payload)
  return {
    vaultId: Math.floor(Math.random() * 10000),
    scheduled: true
  }
}

export type VaultStatus = {
  vaultId: number
  balance: number
  threshold: number
  maxDonation: number
  lastDonation?: {
    magnitude: number
    amount: number
    location: string
    timestamp: string
  }
}

export async function getVaultStatus(): Promise<VaultStatus> {
  // Mocked data for dashboard prototyping.
  return {
    vaultId: 1,
    balance: 420.25,
    threshold: 6,
    maxDonation: 100,
    lastDonation: {
      magnitude: 6.4,
      amount: 100,
      location: "Tokyo, Japan",
      timestamp: new Date().toISOString()
    }
  }
}

export type EarthquakeEvent = {
  id: string
  magnitude: number
  place: string
  time: string
}

export async function fetchRecentEarthquakes(): Promise<EarthquakeEvent[]> {
  // In the sprint deliverable we rely on the oracle worker to populate the chain.
  // For UI development we hit the public USGS feed directly.
  const since = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  const url = new URL("https://earthquake.usgs.gov/fdsnws/event/1/query")
  url.searchParams.set("format", "geojson")
  url.searchParams.set("orderby", "time")
  url.searchParams.set("starttime", since)
  url.searchParams.set("minmagnitude", "5")

  const response = await fetch(url, { next: { revalidate: 60 } })
  if (!response.ok) {
    throw new Error(`Failed to fetch earthquakes: ${response.status}`)
  }
  const data = await response.json() as { features: Array<{ id: string; properties: { mag: number; place: string; time: number } }> }
  return data.features.map((feature) => ({
    id: feature.id,
    magnitude: feature.properties.mag,
    place: feature.properties.place,
    time: new Date(feature.properties.time).toISOString()
  }))
}
