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
  const myRank = players.findIndex((p) => p.id === currentPlayerId) + 1;
  const isInTop3 = myRank > 0 && myRank <= 3;
  const top5 = players.slice(0, 5);

  const myAnswer = myAnswerForCurrentQuestion;
  const isCorrect = myAnswer?.is_correct ?? null;
  const pointsEarned = myAnswer?.points_earned ?? 0;

  return (
    <div className="flex flex-1 flex-col px-4 pt-6 pb-8 gap-5">

      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-xs text-slate-400 font-medium mb-1">
          שאלה {questionNumber} מתוך {totalQuestions}
        </p>
        <h2 className="text-2xl font-extrabold text-slate-900">טבלת מובילים</h2>
      </motion.div>

      {/* My result for this question */}
      {myAnswer && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
        >
          <GlassCard
            className={[
              "p-4 text-center border-2",
              isCorrect
                ? "border-[#22c55e]/40 bg-[#22c55e]/5"
                : "border-[#ef4444]/30 bg-[#ef4444]/5",
            ].join(" ")}
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl">{isCorrect ? "✅" : "❌"}</span>
              <div className="text-right">
                <p className={[
                  "text-lg font-extrabold",
                  isCorrect ? "text-[#15803d]" : "text-[#b91c1c]",
                ].join(" ")}>
                  {isCorrect ? "תשובה נכונה!" : "תשובה שגויה"}
                </p>
                {isCorrect && pointsEarned > 0 && (
                  <p className="text-sm text-[#15803d]/80 font-medium">
                    +{pointsEarned.toLocaleString("he-IL")} נקודות
                  </p>
                )}
              </div>
            </div>

            {/* Correct answer hint */}
            {!isCorrect && currentQuestion && (
              <p className="mt-2 text-xs text-slate-500">
                התשובה הנכונה:{" "}
                <strong className="text-slate-700">
                  {(currentQuestion.options as string[])[currentQuestion.correct_option_index]}
                </strong>
              </p>
            )}
          </GlassCard>
        </motion.div>
      )}

      {/* Leaderboard */}
      <GlassCard className="p-4 space-y-2 flex-1" elevated>
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

      <motion.p
        className="text-center text-sm text-slate-400"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        ממתין לשאלה הבאה…
      </motion.p>
    </div>
  );
}
