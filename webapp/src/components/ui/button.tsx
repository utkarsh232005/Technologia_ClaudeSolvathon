import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 rounded-lg transform hover:scale-105 hover:shadow-xl active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-2xl hover:from-purple-700 hover:to-blue-700 [&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg]:translate-x-1",
        destructive: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-2xl hover:from-red-600 hover:to-red-700 [&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg]:translate-x-1",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-md hover:shadow-lg [&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg]:translate-x-1",
        secondary: "bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg hover:shadow-2xl hover:from-slate-700 hover:to-slate-800 [&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg]:translate-x-1",
        ghost: "hover:bg-accent hover:text-accent-foreground shadow-md hover:shadow-lg [&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg]:translate-x-1",
        link: "text-primary underline-offset-4 hover:underline [&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg]:translate-x-1",
        premium: "bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-semibold text-base h-12 shadow-[0_4px_14px_rgba(139,92,246,0.3)] hover:shadow-[0_6px_24px_rgba(139,92,246,0.45)] hover:scale-[1.02] hover:brightness-105 active:scale-[0.98] transition-all duration-300 cubic-bezier(0.4,0,0.2,1) [&_svg]:animate-pulse [&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg]:translate-x-1",
        "outline-secondary": "border-[1.5px] border-slate-500 bg-transparent text-slate-300 font-medium hover:border-slate-400 hover:bg-slate-600/40 hover:text-slate-200 [&_svg]:text-blue-400 [&_svg]:transition-colors [&_svg]:duration-300 transition-all duration-300 ease-out",
        "outline-example": "border border-slate-700 bg-slate-700/60 text-cyan-300 text-sm font-medium h-10 hover:bg-blue-500/15 hover:border-blue-500 hover:text-blue-300 hover:-translate-y-0.5 transition-all duration-200 ease-out [&_svg]:transition-transform [&_svg]:duration-300",
        "danger-outline": "border-[1.5px] border-red-600 bg-red-500/10 text-red-300 font-medium hover:bg-red-500/20 hover:border-red-400 hover:text-red-200 transition-all duration-300 ease-out [&_svg]:transition-transform [&_svg]:duration-300",
        "expandable": "bg-transparent border-b border-slate-700 text-slate-300 text-sm font-medium hover:text-white hover:border-cyan-500 rounded-none justify-between p-4 transition-all duration-200 ease-out [&_svg]:transition-all [&_svg]:duration-300 hover:[&_svg]:text-cyan-400",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        xl: "h-12 px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
