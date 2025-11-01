import { beforeEach, afterEach, test } from "node:test"
import assert from "node:assert/strict"
import os from "node:os"
import path from "node:path"
import { promises as fs } from "node:fs"

import {
  appendDonation,
  clearVaultStore,
  configureVaultStore,
  createVaultRecord,
  getLatestVault,
  listVaults
} from "../shared/vault-store.js"

let tmpRoot

beforeEach(async () => {
  tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "vault-store-"))
  configureVaultStore({ dataDir: tmpRoot })
  await clearVaultStore()
})

afterEach(async () => {
  if (tmpRoot) {
    await fs.rm(tmpRoot, { recursive: true, force: true })
  }
})

test("createVaultRecord seeds balance and increments id", async () => {
  const first = await createVaultRecord({
    threshold: 6,
    maxDonation: 100,
    depositAmount: 250,
    recipient: "0xRecipient"
  })
  assert.equal(first.id, 1)
  assert.equal(first.balance, 250)
  assert.equal(first.scheduled, true)

  const second = await createVaultRecord({
    threshold: 7,
    maxDonation: 50,
    depositAmount: 25,
    recipient: "0xRecipient"
  })
  assert.equal(second.id, 2)

  const vaults = await listVaults()
  assert.equal(vaults.length, 2)
})

test("appendDonation reduces balance without going negative", async () => {
  const vault = await createVaultRecord({
    threshold: 6,
    maxDonation: 100,
    depositAmount: 75,
    recipient: "0xRecipient"
  })

  const { donation, vault: updated } = await appendDonation(vault.id, {
    sourceId: "event-1",
    magnitude: 6.5,
    amount: 90,
    location: "Somewhere"
  })

  assert.ok(donation)
  assert.equal(donation.amount, 75)
  assert.equal(updated.balance, 0)

  const latest = await getLatestVault()
  assert.ok(latest)
  assert.equal(latest.balance, 0)
})

test("appendDonation ignores duplicate source ids", async () => {
  const vault = await createVaultRecord({
    threshold: 6,
    maxDonation: 100,
    depositAmount: 100,
    recipient: "0xRecipient"
  })

  const first = await appendDonation(vault.id, {
    sourceId: "event-duplicate",
    magnitude: 6.1,
    amount: 40,
    location: "City"
  })
  assert.ok(first.donation)
  assert.equal(first.vault.donations.length, 1)

  const second = await appendDonation(vault.id, {
    sourceId: "event-duplicate",
    magnitude: 6.2,
    amount: 30,
    location: "City"
  })
  assert.equal(second.donation, null)
  assert.equal(second.vault.donations.length, 1)
})
