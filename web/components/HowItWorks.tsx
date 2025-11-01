import { CalendarClock, Earth, HeartHandshake, ShieldCheck } from "lucide-react"
import { Card, CardDescription, CardTitle } from "./ui/card"

const steps = [
  {
    icon: CalendarClock,
    title: "Scheduled monitoring",
    description:
      "A Flow scheduled transaction fires every six hours, requesting the latest USGS data through our oracle worker."
  },
  {
    icon: Earth,
    title: "AI-backed verification",
    description:
      "The worker enriches magnitude and location with GPT-4 context to avoid false positives before touching the chain."
  },
  {
    icon: ShieldCheck,
    title: "On-chain qualification",
    description:
      "Cadence contracts compute which vaults qualify, ensuring deposits stay protected until thresholds are genuinely met."
  },
  {
    icon: HeartHandshake,
    title: "Auto donation",
    description:
      "When criteria align, FLOW is released straight to the Red Cross address—no manual approvals or waiting required."
  }
]

export function HowItWorks() {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-3xl font-semibold text-white">How DisasterVault reacts in minutes</h2>
        <p className="max-w-3xl text-slate-300">
          Every component is production-minded: Flow Actions coordinate the workflow, the oracle confirms seismic events with real
          USGS telemetry, and the UI gives donors full transparency from deposit to disbursement.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {steps.map((step) => (
          <Card key={step.title} className="flex flex-col gap-4 bg-black/40 p-6">
            <step.icon className="h-8 w-8 text-primary-100" aria-hidden="true" />
            <div className="space-y-2">
              <CardTitle>{step.title}</CardTitle>
              <CardDescription>{step.description}</CardDescription>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
