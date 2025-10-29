import "../styles/globals.css"
import type { Metadata } from "next"
import Link from "next/link"
import { Inter } from "next/font/google"
import { ReactNode } from "react"

const inter = Inter({ subsets: ["latin"], display: "swap" })

export const metadata: Metadata = {
  title: "DisasterVault",
  description: "Automated disaster relief vault built on Flow."
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} relative min-h-screen bg-slate-950 text-white`}>
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_55%)]" />
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
          <Link href="/" className="text-lg font-semibold text-white">
            DisasterVault
          </Link>
          <nav className="flex items-center gap-6 text-sm text-slate-300">
            <Link href="/create" className="hover:text-white">
              Create vault
            </Link>
            <Link href="/dashboard" className="hover:text-white">
              Dashboard
            </Link>
            <a href="https://developers.flow.com/" target="_blank" rel="noreferrer" className="hover:text-white">
              Flow docs
            </a>
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
