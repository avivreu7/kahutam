"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Logo, Spinner } from "@/components/ui";
import { verifyAdminPin } from "@/app/actions/admin";

const PIN_LENGTH = 6;

const PAD = [
  ["1","2","3"],
  ["4","5","6"],
  ["7","8","9"],
  ["","0","⌫"],
];

interface Props {
  onSuccess: () => void;
}

export default function PinScreen({ onSuccess }: Props) {
  const [digits, setDigits]   = useState("");
  const [shake, setShake]     = useState(false);
  const [checking, setChecking] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Clean up all pending timers on unmount
  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  function addTimer(fn: () => void, ms: number) {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  }

  async function press(key: string) {
    if (checking) return;

    if (key === "⌫") {
      setDigits((d) => d.slice(0, -1));
      return;
    }
    if (!key || digits.length >= PIN_LENGTH) return;

    const next = digits + key;
    setDigits(next);

    if (next.length === PIN_LENGTH) {
      setChecking(true);
      try {
        const ok = await verifyAdminPin(next);
        if (ok) {
          addTimer(onSuccess, 180);
        } else {
          setShake(true);
          addTimer(() => { setDigits(""); setShake(false); setChecking(false); }, 600);
        }
      } catch {
        setShake(true);
        addTimer(() => { setDigits(""); setShake(false); setChecking(false); }, 600);
      }
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 gap-10">
      <Logo size="md" />

      <div className="text-center">
        <h1 className="text-xl font-bold text-slate-700">גישת מנחה</h1>
        <p className="text-slate-400 text-sm mt-1">הזן קוד גישה</p>
      </div>

      {/* Dot indicators */}
      <motion.div
        className="flex gap-4 h-8 items-center"
        animate={shake ? { x: [-10, 10, -10, 10, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {checking ? (
          <Spinner size="sm" />
        ) : (
          Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: i === digits.length - 1 ? [1, 1.4, 1] : 1,
                backgroundColor: shake
                  ? "#ef4444"
                  : i < digits.length ? "#0070d1" : "#e2e8f0",
              }}
              transition={{ duration: 0.2 }}
              className="w-4 h-4 rounded-full"
            />
          ))
        )}
      </motion.div>

      {/* Keypad */}
      <div className="glass rounded-3xl p-5 w-full max-w-xs shadow-xl shadow-slate-200/60">
        <div className="grid grid-cols-3 gap-3">
          {PAD.flat().map((key, i) => (
            <motion.button
              key={i}
              type="button"
              disabled={!key || checking}
              whileTap={key && !checking ? { scale: 0.88 } : {}}
              onClick={() => press(key)}
              className={[
                "h-16 rounded-2xl text-2xl font-bold select-none transition-colors",
                key
                  ? "bg-white border-2 border-slate-100 text-slate-800 active:bg-slate-50 shadow-sm"
                  : "invisible",
                checking ? "opacity-50" : "",
              ].join(" ")}
            >
              {key}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
