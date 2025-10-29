import axios from "axios"
import dotenv from "dotenv"
import crypto from "crypto"
import { OpenAI } from "openai"

dotenv.config()

const USGS_API = "https://earthquake.usgs.gov/fdsnws/event/1/query"
const SIX_HOURS_MS = 6 * 60 * 60 * 1000

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

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
  const prompt = `An earthquake of magnitude ${magnitude.toFixed(1)} occurred in ${place}. ` +
    "Does this event likely require immediate humanitarian aid? Reply with a single lowercase word: yes or no."
  const completion = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: prompt
  })
  const text = completion.output_text.trim().toLowerCase()
  return text.startsWith("y")
}

async function pushToChain(event: { id: string; mag: number; place: string }) {
  const payload = `${event.id}:${event.mag}:${event.place}`
  const hash = crypto.createHash("sha256").update(payload).digest("hex")
  console.info("[oracle] Update chain", { ...event, hash })
  // TODO: Integrate with Flow CLI to submit Cadence transaction calling EarthquakeOracle.updateData
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
