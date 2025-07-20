import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 rounded-full text-white border-0",
  {
    variants: {
      variant: {
        default: "liquid-glass-button bg-white/15 border border-white/25 hover:bg-gradient-to-r hover:from-purple-500 hover:to-orange-500",
        destructive:
          "liquid-glass-button bg-white/15 border border-white/25 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600",
        outline:
          "liquid-glass-button bg-white/10 border border-white/20 hover:bg-white/20",
        secondary:
          "liquid-glass-button bg-white/10 border border-white/20 hover:bg-white/15",
        ghost: "liquid-glass-button bg-white/5 border border-white/10 hover:bg-white/15",
        link: "text-white underline-offset-4 hover:underline bg-transparent border-none",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
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
