"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  /** Elevate the shadow for "modal" style cards */
  elevated?: boolean;
}

/**
 * Glassmorphism card — the primary surface element across the app.
 * Pure white, backdrop-blur, subtle border, large radius.
 */
export default function GlassCard({
  children,
  className = "",
  elevated = false,
  ...motionProps
}: GlassCardProps) {
  return (
    <motion.div
      className={[
        "glass rounded-3xl",
        elevated
          ? "shadow-2xl shadow-slate-200/80"
          : "shadow-lg shadow-slate-200/60",
        className,
      ].join(" ")}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
