"use client";

import { motion } from "framer-motion";
import { GlassCard, Spinner } from "@/components/ui";
import type { Question } from "@/types/game";

interface Props {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
}

export default function ReadingView({ question, questionNumber, totalQuestions }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 gap-8">

      {/* Progress pill */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0070d1]/10 border border-[#0070d1]/20"
      >
        <span className="text-xs font-semibold text-[#0070d1]">
          שאלה {questionNumber} מתוך {totalQuestions}
        </span>
      </motion.div>

      {/* Question card */}
      <GlassCard
        className="w-full max-w-sm p-7 text-center"
        elevated
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 24, delay: 0.1 }}
      >
        <p className="text-sm font-medium text-[#0070d1] mb-4 tracking-wide">
          קרא/י את השאלה
        </p>
        <h2 className="text-2xl font-extrabold text-slate-900 leading-snug">
          {question.text}
        </h2>
      </GlassCard>

      {/* Waiting for timer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center gap-2 text-slate-400"
      >
        <Spinner size="sm" />
        <span className="text-sm">מיד יתחיל הטיימר…</span>
      </motion.div>
    </div>
  );
}
