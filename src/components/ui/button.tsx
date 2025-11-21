import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium tracking-wide ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "btn-lcars rounded-daystrom-button",
        destructive: "btn-lcars-alert rounded-daystrom-button",
        outline: "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground font-trek-content rounded-daystrom-button shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_1px_0_rgba(0,0,0,0.2)]",
        secondary: "btn-lcars-secondary rounded-daystrom-button",
        ghost: "hover:bg-accent hover:text-accent-foreground font-trek-content rounded-daystrom-button",
        link: "text-primary underline-offset-4 hover:underline font-trek-content",
        // LCARS Enterprise variants
        lcars: "btn-lcars rounded-daystrom-button",
        "lcars-secondary": "btn-lcars-secondary rounded-daystrom-button",
        "lcars-alert": "btn-lcars-alert rounded-daystrom-button",
        tactical: "bg-gradient-to-r from-red-600 to-orange-600 text-white border-2 border-red-500 rounded-daystrom-button shadow-lg hover:shadow-red-500/50 transition-all duration-300 font-trek-heading uppercase tracking-wider shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_1px_0_rgba(0,0,0,0.2)]",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-10 px-4 py-2 text-sm",
        lg: "h-12 px-9 py-3 text-lg",
        icon: "h-11 w-11",
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
