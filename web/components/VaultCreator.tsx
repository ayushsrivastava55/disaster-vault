"use client"

import { useTransition, useState } from "react"
import { createVault } from "../lib/flow"
import { RED_CROSS_ADDRESS } from "../lib/constants"
import { Card, CardDescription, CardTitle } from "./ui/card"
import { Loader2 } from "lucide-react"
import { clsx } from "clsx"

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
        `Vault #${response.vaultId} created with ${depositAmount} FLOW deposited. Scheduled monitoring: ${
          response.scheduled ? "enabled" : "pending"
        }.`
      )
    })
  }

  return (
    <Card className="max-w-xl space-y-6 bg-black/60">
      <div className="space-y-2">
        <CardTitle>Automate your giving</CardTitle>
        <CardDescription>
          Configure a single trigger to automatically donate to the Red Cross when a severe earthquake is detected by the
          DisasterVault oracle network.
        </CardDescription>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-slate-200">Magnitude threshold</legend>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
              <span>6.0 minimum</span>
              <span>9.0 maximum</span>
            </div>
            <input
              type="range"
              min={5}
              max={9}
              step={0.1}
              value={threshold}
              onChange={(event) => setThreshold(Number(event.target.value))}
              className="mt-4 w-full accent-primary-600"
              aria-valuemin={5}
              aria-valuemax={9}
              aria-valuenow={threshold}
            />
            <p className="mt-3 text-sm text-white">
              Trigger when magnitude <span className="font-semibold">≥ {threshold.toFixed(1)}</span>
            </p>
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-200">Maximum donation (FLOW)</span>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2">
              <span className="text-xs uppercase tracking-wide text-slate-400">Cap</span>
              <input
                type="number"
                min={10}
                value={maxDonation}
                onChange={(event) => setMaxDonation(Number(event.target.value))}
                className="w-full bg-transparent text-right text-sm text-white outline-none"
              />
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-200">Initial deposit (FLOW)</span>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2">
              <span className="text-xs uppercase tracking-wide text-slate-400">Seed</span>
              <input
                type="number"
                min={100}
                value={depositAmount}
                onChange={(event) => setDepositAmount(Number(event.target.value))}
                className="w-full bg-transparent text-right text-sm text-white outline-none"
              />
            </div>
          </label>
        </div>

        <div className="rounded-xl border border-primary-600/40 bg-primary-600/10 px-4 py-4 text-sm text-primary-100">
          Funds will be routed to <span className="font-semibold">Red Cross ({RED_CROSS_ADDRESS})</span> when the oracle
          confirms an earthquake above your threshold. Scheduled transactions run every six hours.
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

      {result && (
        <p className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          {result}
        </p>
      )}
    </Card>
  )
}
