"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { GlassCard, OptionButton, Timer } from "@/components/ui";
import { submitAnswer } from "@/app/actions/submit-answer";
import type { OptionState } from "@/components/ui/OptionButton";
import type { Question, Answer } from "@/types/game";

interface Props {
  question: Question;
  questionId: string;
  gameId: string;
  playerId: string;
  questionNumber: number;
  totalQuestions: number;
  questionStartTime: string;
  /** Previously submitted answer (reconnect case) */
  existingAnswer?: Answer | null;
}

export default function AnsweringView({
  question,
  questionId,
  gameId,
  playerId,
  questionNumber,
  totalQuestions,
  questionStartTime,
  existingAnswer,
}: Props) {
  const startTs = new Date(questionStartTime).getTime();
  const totalMs = question.time_limit * 1000;

  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    existingAnswer?.selected_option ?? null
  );
  const [timedOut, setTimedOut] = useState(existingAnswer != null && existingAnswer.selected_option == null);
  const [isPending, startTransition] = useTransition();
  const hasSubmitted = useRef(existingAnswer != null);

  // If we already have an answer from a reconnect, mark as submitted
  useEffect(() => {
    if (existingAnswer != null) {
      hasSubmitted.current = true;
      if (existingAnswer.selected_option != null) {
        setSelectedIndex(existingAnswer.selected_option);
      }
    }
  }, [existingAnswer]);

  function handleSelect(index: number) {
    if (hasSubmitted.current || timedOut) return;
    hasSubmitted.current = true;
    setSelectedIndex(index);

    const responseTimeMs = Date.now() - startTs;

    startTransition(async () => {
      try {
        await submitAnswer({
          playerId,
          questionId,
          gameId,
          selectedOption: index,
          responseTimeMs,
        });
      } catch {
        // Keep local selection state even if server action fails
      }
    });
  }

  function handleExpire() {
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;
    setTimedOut(true);
    // Submit a timeout answer
    startTransition(async () => {
      try {
        await submitAnswer({
          playerId,
          questionId,
          gameId,
          selectedOption: null, // timed out
          responseTimeMs: totalMs,
        });
      } catch {}
    });
  }

  function getOptionState(index: number): OptionState {
    if (selectedIndex === null && !timedOut) return "idle";
    if (selectedIndex === index) return "selected";
    return "disabled";
  }

  return (
    <div className="flex flex-1 flex-col px-4 pt-6 pb-8 gap-5">

      {/* Top bar: progress + timer */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 font-medium">שאלה</span>
          <span className="text-base font-bold text-slate-700">
            {questionNumber} / {totalQuestions}
          </span>
        </div>

        <Timer
          totalSeconds={question.time_limit}
          startTimestamp={startTs}
          onExpire={handleExpire}
        />
      </div>

      {/* Question text */}
      <GlassCard
        className="p-5 text-center"
        elevated
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
      >
        <p className="text-xl font-extrabold text-slate-900 leading-snug">
          {question.text}
        </p>
      </GlassCard>

      {/* Answer options */}
      <div className="flex flex-col gap-3 flex-1">
        {(question.options as string[]).map((opt, i) => (
          <OptionButton
            key={i}
            index={i as 0 | 1 | 2 | 3}
            text={opt}
            state={getOptionState(i)}
            onClick={() => handleSelect(i)}
          />
        ))}
      </div>

      {/* Status after answering */}
      {(selectedIndex !== null || timedOut) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-2"
        >
          {timedOut ? (
            <p className="text-slate-500 font-medium text-sm">לא ענית בזמן</p>
          ) : (
            <p className="text-[#0070d1] font-semibold text-sm">
              {isPending ? "שולח תשובה…" : "תשובה נשלחה! ממתין לתוצאות"}
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
