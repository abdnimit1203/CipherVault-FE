import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent text-sm font-medium whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:brightness-110 border border-white/20",
        outline:
          "border-white/15 bg-white/5 backdrop-blur-md text-foreground hover:bg-white/15 hover:border-white/30 shadow-sm",
        secondary:
          "bg-slate-800/60 backdrop-blur-md text-white border border-white/10 hover:bg-slate-800/90 hover:border-white/20",
        ghost:
          "hover:bg-white/10 text-muted-foreground hover:text-white transition-colors",
        destructive:
          "bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 focus-visible:ring-rose-500/40",
        link: "text-cyan-400 underline-offset-4 hover:underline",
        glass: "glass-button text-white hover:brightness-125",
        gradient: "bg-gradient-to-r from-purple-500/80 to-indigo-600/80 backdrop-blur-md text-white border border-white/30 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:brightness-110"
      },
      size: {
        default:
          "h-10 gap-2 px-5 py-2 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xs: "h-7 gap-1.5 px-3 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-4 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2 px-7 text-base shadow-xl",
        icon: "size-10 rounded-full",
        "icon-xs": "size-7 rounded-full [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-full",
        "icon-lg": "size-12 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
