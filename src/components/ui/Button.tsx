"use client";

import { motion } from "framer-motion";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size    = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[#0070d1] text-white border-transparent " +
    "active:bg-[#005aaa] disabled:bg-slate-300 disabled:text-slate-400",
  secondary:
    "bg-white text-[#0070d1] border-[#0070d1]/30 " +
    "active:bg-[#0070d1]/10 disabled:opacity-40",
  ghost:
    "bg-transparent text-slate-600 border-slate-200 " +
    "active:bg-slate-100 disabled:opacity-40",
  danger:
    "bg-[#ef4444] text-white border-transparent " +
    "active:bg-[#dc2626] disabled:opacity-40",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-11 px-4 text-sm rounded-xl",
  md: "h-14 px-6 text-base rounded-2xl",
  lg: "h-16 px-8 text-lg rounded-2xl",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={[
        "inline-flex items-center justify-center gap-2",
        "font-semibold border-2 select-none no-select tap-highlight",
        "transition-colors duration-150",
        "focus-visible:ring-accent focus-visible:outline-none",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? "w-full" : "",
        isDisabled ? "cursor-not-allowed" : "cursor-pointer",
        className,
      ].join(" ")}
      disabled={isDisabled}
      {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
    >
      {loading ? (
        <span className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </motion.button>
  );
}
