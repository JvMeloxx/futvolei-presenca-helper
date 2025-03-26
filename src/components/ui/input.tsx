
import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, success, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border-2 border-primary/60 bg-white px-3 py-2 text-base text-black ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-primary/70 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          error && "border-destructive/80 bg-destructive/10 focus-visible:border-destructive focus-visible:ring-destructive/30",
          success && "border-green-600 bg-green-50 focus-visible:border-green-600 focus-visible:ring-green-600/30",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
