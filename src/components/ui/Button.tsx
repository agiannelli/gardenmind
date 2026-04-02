import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-sans font-medium rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400 disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-sage-400 text-white hover:bg-sage-600 active:scale-[0.98]":
              variant === "primary",
            "border border-sage-200 text-sage-700 bg-transparent hover:bg-sage-50 hover:border-sage-300":
              variant === "outline",
            "text-sage-600 bg-transparent hover:bg-sage-50":
              variant === "ghost",
          },
          {
            "text-sm px-4 py-2": size === "md",
            "text-xs px-3 py-1.5": size === "sm",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
