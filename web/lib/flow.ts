"use server"

import "server-only"

import { RED_CROSS_ADDRESS } from "./constants"
import { createVaultRecord, getLatestVault, type DonationRecord } from "../../shared/vault-store"

export type VaultCreationPayload = {
  threshold: number
  maxDonation: number
  depositAmount: number
}

export async function createVault(payload: VaultCreationPayload) {
  const record = await createVaultRecord({
    threshold: payload.threshold,
    maxDonation: payload.maxDonation,
    depositAmount: payload.depositAmount,
    recipient: RED_CROSS_ADDRESS
  })

  return {
    vaultId: record.id,
    scheduled: record.scheduled
  }
}

export type VaultStatus = {
  vaultId: number
  balance: number
  threshold: number
  maxDonation: number
  recipient: string
  donations: DonationRecord[]
}

export async function getVaultStatus(): Promise<VaultStatus | null> {
  const record = await getLatestVault()
  if (!record) {
    return null
  }
  return {
    vaultId: record.id,
    balance: record.balance,
    threshold: record.threshold,
    maxDonation: record.maxDonation,
    recipient: record.recipient,
    donations: record.donations
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
  url.searchParams.set("minmagnitude", "6")

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
