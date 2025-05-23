import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-green-100 text-green-700 hover:bg-green-200",
        warning:
          "border-transparent bg-amber-500 text-white hover:bg-amber-500/80",
        info:
          "border-transparent bg-blue-500 text-white hover:bg-blue-500/80",
        pending: 
          "border-transparent bg-yellow-500 text-white hover:bg-yellow-500/80",
        active: 
          "border-transparent bg-emerald-500 text-white hover:bg-emerald-500/80",
        cancelled: 
          "border-transparent bg-red-500 text-white hover:bg-red-500/80",
        completed: 
          "border-transparent bg-green-600 text-white hover:bg-green-600/80",
        processing: 
          "border-transparent bg-purple-500 text-white hover:bg-purple-500/80",
        "paid": 
          "border-transparent bg-green-600 text-white hover:bg-green-600/80",
        "unpaid": 
          "border-transparent bg-red-600 text-white hover:bg-red-600/80",
        "partially-paid": 
          "border-transparent bg-amber-600 text-white hover:bg-amber-600/80",
      },
      size: {
        default: "h-6 px-2.5 py-0.5 text-xs",
        sm: "h-5 px-1.5 py-0 text-xs",
        lg: "h-7 px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants } 