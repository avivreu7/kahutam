"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface TimerProps {
  /** Total duration in seconds */
  totalSeconds: number;
  /** Timestamp (ms) when the timer started */
  startTimestamp: number;
  /** Called when the timer hits zero */
  onExpire?: () => void;
}

const RADIUS       = 36;
const STROKE_WIDTH = 6;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SIZE         = (RADIUS + STROKE_WIDTH) * 2;

function getColor(fraction: number): string {
  if (fraction > 0.5) return "#0070d1";   // PS Blue – plenty of time
  if (fraction > 0.25) return "#fd7e14";  // Amber – getting tight
  return "#ef4444";                        // Red – almost out
}

export default function Timer({ totalSeconds, startTimestamp, onExpire }: TimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const expiredRef = useRef(false);

  useEffect(() => {
    expiredRef.current = false;
    const tick = () => {
      const elapsed  = (Date.now() - startTimestamp) / 1000;
      const left     = Math.max(0, totalSeconds - elapsed);
      setRemaining(left);

      if (left <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
    };

    tick();
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [totalSeconds, startTimestamp, onExpire]);

  const fraction = remaining / totalSeconds;
  const offset   = CIRCUMFERENCE * (1 - fraction);
  const color    = getColor(fraction);
  const secs     = Math.ceil(remaining);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
      {/* Track ring */}
      <svg width={SIZE} height={SIZE} className="absolute inset-0 -rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={STROKE_WIDTH}
        />
        {/* Progress arc */}
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.1s linear, stroke 0.4s ease" }}
        />
      </svg>

      {/* Seconds label */}
      <motion.span
        key={secs}
        initial={{ scale: 1.3, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="relative z-10 font-extrabold text-2xl tabular-nums"
        style={{ color }}
      >
        {secs}
      </motion.span>
    </div>
  );
}
