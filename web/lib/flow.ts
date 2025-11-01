"use client"

import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
import { initializeFCL, DISASTER_VAULT_CONTRACT } from "./fcl-config"
import { RED_CROSS_ADDRESS } from "./constants"

// Import types only (not server functions)
type DonationRecord = {
  sourceId: string
  magnitude: number
  amount: number
  location: string
  timestamp: string
}

// Initialize FCL on module load
if (typeof window !== "undefined") {
  initializeFCL()
}

export type VaultCreationPayload = {
  threshold: number
  maxDonation: number
  depositAmount: number
}

// Use Flow blockchain if user is authenticated, otherwise fall back to local store
export async function createVault(payload: VaultCreationPayload) {
  const user = await fcl.currentUser().snapshot()
  
  // If user is authenticated, use Flow blockchain
  if (user.loggedIn) {
    try {
      return await createVaultOnChain(payload)
    } catch (error) {
      console.error("Failed to create vault on-chain, falling back to local store:", error)
      // Fall through to local store
    }
  }
  
  // Fallback to local store for prototype - call API route
  try {
    const response = await fetch("/api/create-vault", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error("Failed to create vault via API:", error)
  }
  
  // Ultimate fallback
  return {
    vaultId: 0,
    scheduled: false,
    error: "Failed to create vault"
  }
}

async function createVaultOnChain(payload: VaultCreationPayload) {
  // Try to use create_vault_with_deposit first, fallback to create_vault + deposit
  let code = await fetch("/cadence/transactions/create_vault_with_deposit.cdc").then(r => r.text())
    .catch(() => null)
  
  if (!code) {
    // Fallback to separate create_vault transaction
    code = await fetch("/cadence/transactions/create_vault.cdc").then(r => r.text())
      .catch(() => null)
  }
  
  if (!code) {
    throw new Error("Failed to load transaction code")
  }

  // Replace contract addresses in transaction
  const txCode = code.replace(/0xDisasterVault/g, DISASTER_VAULT_CONTRACT)

  let transactionId: string
  
  // Check if this is the combined transaction (has depositAmount parameter)
  if (code.includes("depositAmount")) {
    transactionId = await fcl.mutate({
      cadence: txCode,
      args: (arg: any, t: any) => [
        arg(payload.threshold.toFixed(1), t.UFix64),
        arg(payload.maxDonation.toFixed(1), t.UFix64),
        arg(RED_CROSS_ADDRESS, t.Address),
        arg(payload.depositAmount.toFixed(1), t.UFix64),
      ],
      limit: 1000,
    })
  } else {
    // Use separate transactions
    transactionId = await fcl.mutate({
      cadence: txCode,
      args: (arg: any, t: any) => [
        arg(payload.threshold.toFixed(1), t.UFix64),
        arg(payload.maxDonation.toFixed(1), t.UFix64),
        arg(RED_CROSS_ADDRESS, t.Address),
      ],
      limit: 1000,
    })
    
    // If we have a deposit amount, make a separate deposit transaction
    if (payload.depositAmount > 0) {
      const depositCode = await fetch("/cadence/transactions/deposit.cdc").then(r => r.text())
        .catch(() => null)
      
      if (depositCode) {
        const depositTxCode = depositCode.replace(/0xDisasterVault/g, DISASTER_VAULT_CONTRACT)
        // Note: We'd need the vault ID from the first transaction
        // For now, we'll just log that deposit is needed
        console.warn("Deposit transaction needed separately - vault ID required")
      }
    }
  }

  const sealedTx = await fcl.tx(transactionId).onceSealed()
  
  // Extract vault ID from transaction logs/events
  // In production, parse the VaultCreated event
  let vaultId = 1 // Default fallback
  
  // Try to extract from events or logs
  if (sealedTx.events) {
    const vaultCreatedEvent = sealedTx.events.find((e: any) => 
      e.type.includes("VaultCreated") || e.type.includes("DisasterVault.VaultCreated")
    )
    if (vaultCreatedEvent) {
      // Parse event data if available
      console.log("VaultCreated event:", vaultCreatedEvent)
    }
  }
  
  // Store transaction ID for tracking
  // In production, parse vault ID from events
  try {
    const response = await fetch("/api/create-vault", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, transactionId })
    })
    if (response.ok) {
      const result = await response.json()
      return {
        ...result,
        transactionId
      }
    }
  } catch (error) {
    console.error("Failed to store vault record:", error)
  }

  return {
    vaultId: 0,
    scheduled: true,
    transactionId
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

export async function getVaultStatus(vaultId?: number): Promise<VaultStatus | null> {
  const user = await fcl.currentUser().snapshot()
  
  // If user is authenticated and we have a vault ID, try to fetch from chain
  if (user.loggedIn && vaultId) {
    try {
      return await getVaultStatusOnChain(vaultId)
    } catch (error) {
      console.error("Failed to fetch vault from chain, falling back to local store:", error)
    }
  }
  
  // Fallback to local store via API
  try {
    const response = await fetch("/api/vault-status")
    if (response.ok) {
      const data = await response.json()
      return data
    }
  } catch (error) {
    console.error("Failed to fetch vault status:", error)
  }
  
  return null
}

async function getVaultStatusOnChain(vaultId: number): Promise<VaultStatus | null> {
  const code = await fetch("/cadence/scripts/get_vault_details.cdc").then(r => r.text())
    .catch(() => null)
  
  if (!code) {
    throw new Error("Failed to load script code")
  }

  const txCode = code.replace(/0xDisasterVault/g, DISASTER_VAULT_CONTRACT)

  const result = await fcl.query({
    cadence: txCode,
    args: (arg: any, t: any) => [arg(vaultId.toString(), t.UInt64)],
  })

  if (!result) return null

  // Fetch donation history
  const donationCode = await fetch("/cadence/scripts/get_donation_history.cdc").then(r => r.text())
    .catch(() => null)

  let donations: DonationRecord[] = []
  if (donationCode) {
    const donationTxCode = donationCode.replace(/0xDisasterVault/g, DISASTER_VAULT_CONTRACT)
    try {
      const donationHistory = await fcl.query({
        cadence: donationTxCode,
        args: (arg: any, t: any) => [arg(vaultId.toString(), t.UInt64)],
      })
      
      donations = (donationHistory || []).map((d: any) => ({
        sourceId: `chain-${d.timestamp}`,
        magnitude: parseFloat(d.magnitude),
        amount: parseFloat(d.amount),
        location: d.location || "Unknown",
        timestamp: new Date(parseFloat(d.timestamp) * 1000).toISOString()
      }))
    } catch (error) {
      console.error("Failed to fetch donation history:", error)
    }
  }

  return {
    vaultId: result.id,
    balance: parseFloat(result.balance),
    threshold: parseFloat(result.magnitudeThreshold),
    maxDonation: parseFloat(result.maxDonation),
    recipient: result.recipient,
    donations
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

// Wallet connection helpers
export async function authenticate() {
  return fcl.authenticate()
}

export async function unauthenticate() {
  return fcl.unauthenticate()
}

export function currentUser() {
  return fcl.currentUser()
}
