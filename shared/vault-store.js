import { promises as fs } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const defaultDataDir = path.join(__dirname, "..", "data")

let dataDir = defaultDataDir
let storePath = path.join(dataDir, "vaults.json")

function normaliseDataDir(dir) {
  if (!dir) {
    return defaultDataDir
  }
  return path.resolve(dir)
}

export function configureVaultStore(options = {}) {
  const hasExplicitDir = Object.prototype.hasOwnProperty.call(options, "dataDir")
  const override = hasExplicitDir ? options.dataDir : process.env.DISASTER_VAULT_DATA_DIR ?? null
  dataDir = normaliseDataDir(override)
  storePath = path.join(dataDir, "vaults.json")
}

configureVaultStore()

async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true })
  try {
    await fs.access(storePath)
  } catch {
    const emptyStore = { nextId: 1, vaults: [] }
    await fs.writeFile(storePath, JSON.stringify(emptyStore, null, 2), "utf-8")
  }
}

function cloneVault(vault) {
  return {
    ...vault,
    donations: vault.donations.map((donation) => ({ ...donation }))
  }
}

async function readStore() {
  await ensureStore()
  const raw = await fs.readFile(storePath, "utf-8")
  const parsed = JSON.parse(raw)
  parsed.vaults = (parsed.vaults ?? []).map((vault) => ({
    ...vault,
    donations: (vault.donations ?? []).map((donation) => ({ ...donation }))
  }))
  if (typeof parsed.nextId !== "number" || parsed.nextId < 1) {
    parsed.nextId = Math.max(1, parsed.vaults.length + 1)
  }
  return parsed
}

async function writeStore(store) {
  await fs.writeFile(storePath, JSON.stringify(store, null, 2), "utf-8")
}

function toPositiveNumber(value, fallback = 0) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback
  }
  return Math.max(fallback, Number(value))
}

export async function createVaultRecord(params) {
  const store = await readStore()
  const id = store.nextId
  const record = {
    id,
    threshold: toPositiveNumber(params.threshold, 0),
    maxDonation: toPositiveNumber(params.maxDonation, 0),
    recipient: params.recipient,
    balance: toPositiveNumber(params.depositAmount, 0),
    createdAt: new Date().toISOString(),
    scheduled: params.scheduled ?? true,
    donations: []
  }
  store.nextId = id + 1
  store.vaults.push(record)
  await writeStore(store)
  return cloneVault(record)
}

export async function listVaults() {
  const store = await readStore()
  return store.vaults.map(cloneVault)
}

export async function getLatestVault() {
  const store = await readStore()
  if (store.vaults.length === 0) {
    return null
  }
  const latest = store.vaults[store.vaults.length - 1]
  return cloneVault(latest)
}

export async function appendDonation(vaultId, donation) {
  const store = await readStore()
  const vault = store.vaults.find((entry) => entry.id === vaultId)
  if (!vault) {
    throw new Error(`Vault ${vaultId} not found in store`)
  }
  if (vault.donations.some((entry) => entry.sourceId === donation.sourceId)) {
    return { donation: null, vault: cloneVault(vault) }
  }
  const timestamp = donation.timestamp ?? new Date().toISOString()
  const requestedAmount = toPositiveNumber(donation.amount, 0)
  const amount = Math.min(vault.balance, requestedAmount)
  const entry = {
    sourceId: donation.sourceId,
    magnitude: Number(donation.magnitude) || 0,
    location: donation.location,
    amount,
    timestamp
  }
  vault.balance = Math.max(0, Number((vault.balance - amount).toFixed(2)))
  vault.donations.push(entry)
  await writeStore(store)
  return { donation: entry, vault: cloneVault(vault) }
}

export async function clearVaultStore() {
  await fs.rm(storePath, { force: true })
}
