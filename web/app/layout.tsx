import "../styles/globals.css"
import type { Metadata } from "next"
import { ReactNode } from "react"

export const metadata: Metadata = {
  title: "DisasterVault",
  description: "Automated disaster relief vault built on Flow."
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
          <a href="/" className="text-lg font-semibold text-white">DisasterVault</a>
          <nav className="flex items-center gap-4 text-sm text-slate-300">
            <a href="/create">Create vault</a>
            <a href="/dashboard">Dashboard</a>
            <a href="https://developers.flow.com/" target="_blank" rel="noreferrer">Flow docs</a>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-6xl px-6 pb-24">{children}</main>
        <footer className="border-t border-white/5 bg-black/40 py-6 text-center text-xs text-slate-500">
          Built for Forte Hacks 2025 · Flow Testnet prototype
        </footer>
      </body>
    </html>
  )
}
