import * as React from "react"
import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <div className="relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input">
      <input
        type="checkbox"
        className={cn(
          "peer absolute h-0 w-0 opacity-0",
          className
        )}
        ref={ref}
        {...props}
      />
      <span 
        className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-checked:translate-x-5 data-unchecked:translate-x-0 peer-checked:translate-x-5"
        data-state={props.checked ? "checked" : "unchecked"}
      />
    </div>
  )
})

Switch.displayName = "Switch"

export { Switch } 