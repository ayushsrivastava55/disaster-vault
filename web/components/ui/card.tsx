import { type PropsWithChildren } from "react"
import { cn } from "../../lib/cn"

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/30 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary-600/40",
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardTitle({ children }: PropsWithChildren) {
  return <h2 className="text-lg font-semibold text-white">{children}</h2>
}

export function CardDescription({ children }: PropsWithChildren) {
  return <p className="mt-1 text-sm text-slate-300">{children}</p>
}
