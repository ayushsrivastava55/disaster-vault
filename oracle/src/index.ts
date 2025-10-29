import axios from "axios"
import dotenv from "dotenv"
import crypto from "crypto"
import path from "path"
import { fileURLToPath } from "url"
import { execFile } from "child_process"
import { promisify } from "util"
import { OpenAI } from "openai"
import { getLatestVault } from "../../shared/vault-store.js"

dotenv.config()

const USGS_API = "https://earthquake.usgs.gov/fdsnws/event/1/query"
const SIX_HOURS_MS = 6 * 60 * 60 * 1000
const execFileAsync = promisify(execFile)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.join(__dirname, "..", "..")

const openaiApiKey = process.env.OPENAI_API_KEY
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null

async function fetchEarthquakes() {
  const start = new Date(Date.now() - SIX_HOURS_MS).toISOString()
  const response = await axios.get(USGS_API, {
    params: {
      format: "geojson",
      starttime: start,
      minmagnitude: 5,
      orderby: "time"
    }
  })
  return response.data.features as Array<{
    id: string
    properties: { mag: number; place: string; time: number }
  }>
}

async function analyzeSeverity(magnitude: number, place: string) {
  if (!openai) {
    // Fall back to a deterministic rule during local development when no API key is present.
    return magnitude >= 6
  }

  const prompt = `An earthquake of magnitude ${magnitude.toFixed(1)} occurred in ${place}. ` +
    "Does this event likely require immediate humanitarian aid? Reply with a single lowercase word: yes or no."
  const completion = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: prompt
  })
  const text = completion.output_text.trim().toLowerCase()
  return text.startsWith("y")
}

async function submitOnChainUpdate(event: { mag: number; place: string }, hash: string) {
  if (process.env.FLOW_SEND_UPDATES !== "true") {
    return
  }

  const network = process.env.FLOW_NETWORK ?? "testnet"
  const signer = process.env.FLOW_ORACLE_SIGNER ?? "oracle-account"
  const magnitudeArg = `UFix64:${event.mag.toFixed(1)}`
  const safePlace = event.place.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
  const locationArg = `String:\"${safePlace}\"`
  const hashArg = `String:${hash}`

  const args = [
    "transactions",
    "send",
    "cadence/transactions/update_oracle.cdc",
    "--network",
    network,
    "--signer",
    signer,
    "--arg",
    magnitudeArg,
    "--arg",
    locationArg,
    "--arg",
    hashArg
  ]

  try {
    const { stdout, stderr } = await execFileAsync("flow", args, { cwd: repoRoot })
    if (stdout.trim().length > 0) {
      console.info("[oracle] Flow CLI", stdout.trim())
    }
    if (stderr.trim().length > 0) {
      console.warn("[oracle] Flow CLI stderr", stderr.trim())
    }
  } catch (error) {
    console.error("[oracle] Failed to submit Flow transaction", error)
  }
}

async function pushToChain(event: { id: string; mag: number; place: string }) {
  const payload = `${event.id}:${event.mag}:${event.place}`
  const hash = crypto.createHash("sha256").update(payload).digest("hex")
  console.info("[oracle] Update chain", { ...event, hash })
  // TODO: Integrate with Flow CLI to submit Cadence transaction calling EarthquakeOracle.updateData

  const vault = await getLatestVault()
  if (!vault) {
    console.warn("[oracle] No vaults available; waiting for a vault before executing donations")
    return
  }

  console.info(
    `[oracle] Ready to execute donation of up to ${vault.maxDonation.toFixed(2)} FLOW for magnitude ${event.mag.toFixed(1)} at ${event.place}`
  )

  await submitOnChainUpdate({ mag: event.mag, place: event.place }, hash)
}

export async function monitorOnce() {
  const earthquakes = await fetchEarthquakes()
  for (const event of earthquakes) {
    const magnitude = event.properties.mag
    if (magnitude < 6) continue
    const place = event.properties.place ?? "Unknown location"
    const requiresAid = await analyzeSeverity(magnitude, place)
    if (!requiresAid) continue
    await pushToChain({ id: event.id, mag: magnitude, place })
  }
}

async function main() {
  console.log("DisasterVault oracle started. Monitoring every six hours…")
  await monitorOnce()
  setInterval(monitorOnce, SIX_HOURS_MS)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Oracle crashed", error)
    process.exit(1)
  })
}
