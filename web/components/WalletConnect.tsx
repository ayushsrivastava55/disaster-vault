"use client"

import { useEffect, useState } from "react"
import * as fcl from "@onflow/fcl"
import { currentUser } from "../lib/flow"
import { Card } from "./ui/card"
import { cn } from "../lib/cn"

export function WalletConnect() {
  const [user, setUser] = useState<{ loggedIn?: boolean; addr?: string }>({ loggedIn: false })

  useEffect(() => {
    currentUser().subscribe(setUser)
  }, [])

  const handleConnect = async () => {
    try {
      await fcl.authenticate()
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  const handleDisconnect = async () => {
    try {
      await fcl.unauthenticate()
    } catch (error) {
      console.error("Failed to disconnect wallet:", error)
    }
  }

  return (
    <Card className={cn("bg-black/60 p-4")}>
      {user.loggedIn ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-white">Connected</p>
              <p className="text-xs text-slate-400">{user.addr}</p>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Connect Flow Wallet</p>
            <p className="text-xs text-slate-400">Use Flow blockchain features</p>
          </div>
          <button
            onClick={handleConnect}
            className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-900"
          >
            Connect
          </button>
        </div>
      )}
    </Card>
  )
}

