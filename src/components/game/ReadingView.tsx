"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui";
import type { Question } from "@/types/game";

const BG_SHAPES = [
  { shape: "▲", x: "10%",  y: "15%", r: 12  },
  { shape: "◆", x: "80%",  y: "10%", r: -18 },
  { shape: "■", x: "18%",  y: "70%", r: 28  },
  { shape: "●", x: "76%",  y: "68%", r: -8  },
] as const;

interface Props {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  playerStreak?: number;
}

export default function ReadingView({
  question,
  questionNumber,
  totalQuestions,
  playerStreak = 0,
}: Props) {
  const progressPct = (questionNumber / totalQuestions) * 100;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 gap-5 relative overflow-hidden">

      {/* Floating background shapes */}
      {BG_SHAPES.map((s, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="absolute pointer-events-none select-none text-7xl opacity-[0.04]"
          style={{ left: s.x, top: s.y }}
          animate={{
            rotate: [s.r, s.r + 360],
            y: [-8, 8, -8],
          }}
          transition={{
            rotate: { duration: 14 + i * 4, repeat: Infinity, ease: "linear" },
            y:      { duration: 4 + i,      repeat: Infinity, ease: "easeInOut" },
          }}
        >
          {s.shape}
        </motion.span>
      ))}

      {/* Question counter + progress bar */}
      <motion.div
        className="flex flex-col items-center gap-2 z-10"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      >
        <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#0070d1]/10 border border-[#0070d1]/20">
          <span className="text-sm font-extrabold text-[#0070d1]">
            שאלה {questionNumber} מתוך {totalQuestions}
          </span>
        </div>

        <div className="w-52 h-2 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#0070d1] rounded-full"
            initial={{ width: `${((questionNumber - 1) / totalQuestions) * 100}%` }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* Streak badge */}
      {playerStreak >= 2 && (
        <motion.div
          initial={{ opacity: 0, scale: 0, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 22, delay: 0.15 }}
          className="z-10 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-orange-100 border border-orange-300"
        >
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.7, repeat: Infinity }}
          >
            🔥
          </motion.span>
          <span className="text-sm font-extrabold text-orange-700">
            רצף ×{playerStreak}
          </span>
        </motion.div>
      )}

      {/* Question card — drops in from above */}
      <GlassCard
        className="w-full max-w-sm p-7 text-center z-10"
        elevated
        initial={{ opacity: 0, y: 70, scale: 0.82 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 170, damping: 17, delay: 0.08 }}
      >
        <p className="text-xs font-bold text-[#0070d1] mb-4 tracking-widest uppercase">
          קרא/י את השאלה
        </p>
        <h2 className="text-2xl font-extrabold text-slate-900 leading-snug">
          {question.text}
        </h2>
      </GlassCard>

      {/* Bouncing dots — waiting for timer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="flex items-center gap-2 z-10"
      >
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-[#0070d1]"
              animate={{ y: [0, -9, 0], opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 0.85,
                repeat: Infinity,
                delay: i * 0.18,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        <span className="text-sm text-slate-400 font-medium">מיד יתחיל הטיימר…</span>
      </motion.div>
    </div>
  );
}
