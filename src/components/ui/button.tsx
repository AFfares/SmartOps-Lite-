import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/40 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-linear-to-r from-indigo-500 via-indigo-400 to-sky-400 text-white shadow-sm shadow-indigo-500/20 hover:brightness-[1.05]",
        secondary: "bg-slate-800/60 text-slate-100 hover:bg-slate-800/80",
        outline: "border border-slate-700/60 bg-transparent text-slate-100 hover:bg-slate-800/40",
        ghost: "bg-transparent text-slate-200/80 hover:bg-slate-800/40 hover:text-slate-100",
        destructive: "bg-red-500/90 text-white hover:bg-red-500",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 px-3",
        lg: "h-11 px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ComponentPropsWithoutRef<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<React.ElementRef<"button">, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";
