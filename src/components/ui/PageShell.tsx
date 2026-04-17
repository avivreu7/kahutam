"use client";

import { motion } from "framer-motion";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Full-screen page wrapper with PS5 light-mode pearl-white background
 * and two animated decorative blur orbs.
 */
export default function PageShell({ children, className = "" }: PageShellProps) {
  return (
    <div className={`relative min-h-screen w-full bg-slate-50 overflow-hidden ${className}`}>
      {/* Orb — top-right (PS Blue), slow drift */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, #3b9eff, transparent 70%)", opacity: 0.22 }}
        animate={{
          scale: [1, 1.15, 1],
          x: [0, 16, 0],
          y: [0, -12, 0],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Orb — bottom-left (violet accent), slow drift */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-32 w-80 h-80 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, #a78bfa, transparent 70%)", opacity: 0.13 }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -14, 0],
          y: [0, 10, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
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
