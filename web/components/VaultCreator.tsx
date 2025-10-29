"use client"

import { useTransition, useState } from "react"
import { createVault } from "../lib/flow"
import { Card, CardDescription, CardTitle } from "./ui/card"
import { Loader2 } from "lucide-react"
import { clsx } from "clsx"

const RED_CROSS_ADDRESS = "0xRedCross"

export function VaultCreator() {
  const [threshold, setThreshold] = useState(6)
  const [maxDonation, setMaxDonation] = useState(100)
  const [depositAmount, setDepositAmount] = useState(500)
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<string | null>(null)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    startTransition(async () => {
      setResult(null)
      const response = await createVault({ threshold, maxDonation, depositAmount })
      setResult(
        `Vault #${response.vaultId} created. Scheduled monitoring: ${response.scheduled ? "enabled" : "pending"}.`
      )
    })
  }

  return (
    <Card className="max-w-xl">
      <CardTitle>Automate your giving</CardTitle>
      <CardDescription>
        Configure a single trigger to automatically donate to the Red Cross when a severe earthquake is
        detected by the DisasterVault oracle network.
      </CardDescription>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-slate-200">Magnitude threshold</span>
          <input
            type="range"
            min={5}
            max={9}
            step={0.1}
            value={threshold}
            onChange={(event) => setThreshold(Number(event.target.value))}
            className="mt-2 w-full"
          />
          <span className="mt-1 block text-xs text-slate-300">Trigger when magnitude ≥ {threshold.toFixed(1)}</span>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-200">Maximum donation (FLOW)</span>
          <input
            type="number"
            min={10}
            value={maxDonation}
            onChange={(event) => setMaxDonation(Number(event.target.value))}
            className="mt-2 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-200">Initial deposit (FLOW)</span>
          <input
            type="number"
            min={100}
            value={depositAmount}
            onChange={(event) => setDepositAmount(Number(event.target.value))}
            className="mt-2 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
        </label>

        <div className="rounded-lg border border-primary-600/40 bg-primary-600/10 px-4 py-3 text-sm text-primary-100">
          Funds will be routed to <span className="font-semibold">Red Cross ({RED_CROSS_ADDRESS})</span> when the
          oracle confirms an earthquake above your threshold. Scheduled transactions run every six hours.
        </div>

        <button
          type="submit"
          disabled={isPending}
          className={clsx(
            "flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-900",
            isPending && "opacity-80"
          )}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating vault…
            </>
          ) : (
            "Create vault"
          )}
        </button>
      </form>

      {result && <p className="mt-4 text-sm text-emerald-300">{result}</p>}
    </Card>
  )
}
