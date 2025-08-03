import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium tracking-wide ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "btn-lcars",
        destructive: "btn-lcars-alert",
        outline: "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground font-trek-content rounded-md",
        secondary: "btn-lcars-secondary",
        ghost: "hover:bg-accent hover:text-accent-foreground font-trek-content rounded-md",
        link: "text-primary underline-offset-4 hover:underline font-trek-content",
        // LCARS Enterprise variants
        lcars: "btn-lcars",
        "lcars-secondary": "btn-lcars-secondary",
        "lcars-alert": "btn-lcars-alert",
        tactical: "bg-gradient-to-r from-red-600 to-orange-600 text-white border-2 border-red-500 rounded-lg shadow-lg hover:shadow-red-500/50 transition-all duration-300 font-trek-heading uppercase tracking-wider",
      },
      size: {
        default: "h-11 px-5 py-2.5 rounded-lg",
        sm: "h-10 px-4 py-2 rounded-md text-sm",
        lg: "h-12 px-9 py-3 rounded-lg text-lg",
        icon: "h-11 w-11 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
