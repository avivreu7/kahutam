"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GlassCard, LeaderboardRow, Badge } from "@/components/ui";
import type { Player, Answer, Question } from "@/types/game";

interface Props {
  players: Player[];
  currentPlayerId: string;
  myAnswerForCurrentQuestion: Answer | null;
  currentQuestion: Question | null;
  questionNumber: number;
  totalQuestions: number;
}

export default function LeaderboardView({
  players,
  currentPlayerId,
  myAnswerForCurrentQuestion,
  currentQuestion,
  questionNumber,
  totalQuestions,
}: Props) {
  const myRank   = players.findIndex((p) => p.id === currentPlayerId) + 1;
  const isInTop3 = myRank > 0 && myRank <= 3;
  const top5     = players.slice(0, 5);

  const myAnswer    = myAnswerForCurrentQuestion;
  const isCorrect   = myAnswer?.is_correct ?? null;
  const pointsEarned = myAnswer?.points_earned ?? 0;
  const myPlayer    = players.find((p) => p.id === currentPlayerId);
  const myStreak    = myPlayer?.current_streak ?? 0;

  return (
    <div className="flex flex-1 flex-col px-4 pt-6 pb-8 gap-4 overflow-hidden">

      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
      >
        <p className="text-xs text-slate-400 font-medium mb-1">
          שאלה {questionNumber} מתוך {totalQuestions}
        </p>
        <h2 className="text-2xl font-extrabold text-slate-900">טבלת מובילים</h2>
      </motion.div>

      {/* Result card — my answer for this question */}
      {myAnswer && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 22, delay: 0.05 }}
        >
          <GlassCard
            className={[
              "p-4 border-2",
              isCorrect
                ? "border-[#22c55e]/50 bg-[#22c55e]/8"
                : "border-[#ef4444]/40 bg-[#ef4444]/8",
            ].join(" ")}
          >
            <div className="flex items-center gap-4">
              {/* Big emoji */}
              <motion.span
                className="text-5xl shrink-0"
                animate={{
                  scale: [0, 1.35, 1],
                  rotate: [0, isCorrect ? 12 : -12, 0],
                }}
                transition={{ duration: 0.55, type: "spring", stiffness: 320 }}
              >
                {isCorrect ? "🎯" : "💔"}
              </motion.span>

              <div className="flex-1 text-right">
                <p
                  className={[
                    "text-xl font-black",
                    isCorrect ? "text-[#15803d]" : "text-[#b91c1c]",
                  ].join(" ")}
                >
                  {isCorrect ? "תשובה נכונה!" : "תשובה שגויה"}
                </p>

                {/* Points earned */}
                {isCorrect && pointsEarned > 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="text-[#15803d] font-bold text-base"
                  >
                    +{pointsEarned.toLocaleString("he-IL")} נקודות
                  </motion.p>
                )}

                {/* Streak badge */}
                {isCorrect && myStreak >= 2 && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-orange-100 border border-orange-300 text-xs font-extrabold text-orange-700"
                  >
                    🔥 רצף ×{myStreak}
                  </motion.span>
                )}

                {/* Correct answer hint */}
                {!isCorrect && currentQuestion && (
                  <p className="mt-1 text-xs text-slate-500">
                    התשובה הנכונה:{" "}
                    <strong className="text-slate-700">
                      {(currentQuestion.options as string[])[currentQuestion.correct_option_index]}
                    </strong>
                  </p>
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Leaderboard */}
      <GlassCard className="p-4 space-y-2 flex-1 overflow-y-auto scrollbar-hide" elevated>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-500">דירוג</h3>
          {!isInTop3 && myRank > 0 && (
            <Badge variant="blue">אתה במקום #{myRank}</Badge>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {top5.map((player, i) => (
            <LeaderboardRow
              key={player.id}
              rank={i + 1}
              nickname={player.nickname}
              avatar={player.avatar}
              score={player.score}
              isCurrentPlayer={player.id === currentPlayerId}
              animationIndex={i}
            />
          ))}
        </AnimatePresence>

        {/* Current player if outside top 5 */}
        {myRank > 5 && (
          <>
            <div className="flex items-center gap-2 my-1">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400">…</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            {players[myRank - 1] && (
              <LeaderboardRow
                rank={myRank}
                nickname={players[myRank - 1].nickname}
                avatar={players[myRank - 1].avatar}
                score={players[myRank - 1].score}
                isCurrentPlayer
                animationIndex={5}
              />
            )}
          </>
        )}
      </GlassCard>

      {/* Waiting for next question */}
      <motion.div
        className="flex items-center justify-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-slate-400"
              animate={{ y: [0, -6, 0], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
        <p className="text-sm text-slate-400">ממתין לשאלה הבאה…</p>
      </motion.div>
    </div>
  );
}
