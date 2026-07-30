import * as React from "react"


import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-2xl glass-input px-4 py-2 text-sm transition-all duration-200 outline-none focus-visible:border-cyan-400/50 focus-visible:ring-2 focus-visible:ring-cyan-400/30 disabled:pointer-events-none disabled:opacity-50 placeholder:text-slate-400/60",
        className
      )}
      {...props}
    />
  )
}

export { Input }
