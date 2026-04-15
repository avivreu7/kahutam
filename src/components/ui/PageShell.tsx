"use client";

import { motion } from "framer-motion";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Full-screen page wrapper with PS5 light-mode pearl-white background
 * and two decorative blur orbs (consistent with PS5 UI aesthetic).
 */
export default function PageShell({ children, className = "" }: PageShellProps) {
  return (
    <div className={`relative min-h-screen w-full bg-slate-50 overflow-hidden ${className}`}>
      {/* Decorative orb – top-right (PS Blue) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #3b9eff, transparent 70%)" }}
      />
      {/* Decorative orb – bottom-left (slate) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, #94a3b8, transparent 70%)" }}
      />

      <motion.div
        className="relative z-10 flex flex-col min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
