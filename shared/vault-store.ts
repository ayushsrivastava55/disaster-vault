import { promises as fs } from "fs"
import path from "path"
import { fileURLToPath } from "url"

export type DonationRecord = {
  sourceId: string
  magnitude: number
  amount: number
  location: string
  timestamp: string
}

export type StoredVault = {
  id: number
  balance: number
  threshold: number
  maxDonation: number
  recipient: string
  createdAt: string
  scheduled: boolean
  donations: DonationRecord[]
}

type VaultStore = {
  nextId: number
  vaults: StoredVault[]
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, "..", "data")
const storePath = path.join(dataDir, "vaults.json")

async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true })
  try {
    await fs.access(storePath)
  } catch {
    const emptyStore: VaultStore = { nextId: 1, vaults: [] }
    await fs.writeFile(storePath, JSON.stringify(emptyStore, null, 2), "utf-8")
  }
}

function cloneVault(vault: StoredVault): StoredVault {
  return {
    ...vault,
    donations: vault.donations.map((donation) => ({ ...donation }))
  }
}

async function readStore(): Promise<VaultStore> {
  await ensureStore()
  const raw = await fs.readFile(storePath, "utf-8")
  const parsed = JSON.parse(raw) as VaultStore
  parsed.vaults = parsed.vaults.map((vault) => ({
    ...vault,
    donations: vault.donations ?? []
  }))
  return parsed
}

async function writeStore(store: VaultStore) {
  await fs.writeFile(storePath, JSON.stringify(store, null, 2), "utf-8")
}

export async function createVaultRecord(params: {
  threshold: number
  maxDonation: number
  depositAmount: number
  recipient: string
  scheduled?: boolean
}): Promise<StoredVault> {
  const store = await readStore()
  const id = store.nextId
  const record: StoredVault = {
    id,
    threshold: params.threshold,
    maxDonation: params.maxDonation,
    recipient: params.recipient,
    balance: Math.max(0, params.depositAmount),
    createdAt: new Date().toISOString(),
    scheduled: params.scheduled ?? true,
    donations: []
  }
  store.nextId = id + 1
  store.vaults.push(record)
  await writeStore(store)
  return cloneVault(record)
}

export async function listVaults(): Promise<StoredVault[]> {
  const store = await readStore()
  return store.vaults.map(cloneVault)
}

export async function getLatestVault(): Promise<StoredVault | null> {
  const store = await readStore()
  if (store.vaults.length === 0) {
    return null
  }
  const latest = store.vaults[store.vaults.length - 1]
  return cloneVault(latest)
}

export async function appendDonation(
  vaultId: number,
  donation: Omit<DonationRecord, "timestamp"> & { timestamp?: string }
): Promise<{ donation: DonationRecord | null; vault: StoredVault }> {
  const store = await readStore()
  const vault = store.vaults.find((entry) => entry.id === vaultId)
  if (!vault) {
    throw new Error(`Vault ${vaultId} not found in store`)
  }
  if (vault.donations.some((entry) => entry.sourceId === donation.sourceId)) {
    return { donation: null, vault: cloneVault(vault) }
  }
  const timestamp = donation.timestamp ?? new Date().toISOString()
  const amount = Math.min(vault.balance, donation.amount)
  const entry: DonationRecord = {
    sourceId: donation.sourceId,
    magnitude: donation.magnitude,
    location: donation.location,
    amount,
    timestamp
  }
  vault.balance = Math.max(0, Number((vault.balance - amount).toFixed(2)))
  vault.donations.push(entry)
  await writeStore(store)
  return { donation: entry, vault: cloneVault(vault) }
}
