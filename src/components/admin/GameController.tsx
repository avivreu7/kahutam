"use client";

import { useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard, Button, Badge, Spinner } from "@/components/ui";
import { advanceGame, deleteGame, type AdminAction } from "@/app/actions/admin";
import { useGameState } from "@/hooks/useGameState";
import { createClient } from "@/lib/supabase/client";
import useSWR from "swr";
import type { GameStatus } from "@/types/game";

/** How many players have submitted an answer for a given question */
function useAnsweredCount(questionId: string | null) {
  return useSWR(
    questionId ? ["answeredCount", questionId] : null,
    async ([, qId]) => {
      const { count } = await createClient()
        .from("answers")
        .select("id", { count: "exact", head: true })
        .eq("question_id", qId);
      return count ?? 0;
    },
    { refreshInterval: 1500, refreshWhenHidden: false }
  );
}

interface Props {
  gameId: string;
  onGameDeleted: () => void;
}

const STATUS_LABELS: Record<GameStatus, string> = {
  lobby:       "🟡 לובי – ממתין לשחקנים",
  reading:     "📖 קריאת שאלה",
  answering:   "⏱ מענה פעיל",
  leaderboard: "🏆 לוח תוצאות",
  finished:    "✅ הסתיים",
};

const STATUS_BADGE: Record<GameStatus, "slate" | "orange" | "blue" | "green" | "red"> = {
  lobby:       "orange",
  reading:     "blue",
  answering:   "red",
  leaderboard: "green",
  finished:    "slate",
};

export default function GameController({ gameId, onGameDeleted }: Props) {
  const { data, isLoading } = useGameState(gameId, null);
  const [isPending, startTransition] = useTransition();
  const { data: answeredCount = 0 } = useAnsweredCount(
    data?.currentQuestionId ?? null
  );

  function act(action: AdminAction) {
    startTransition(async () => { await advanceGame(gameId, action); });
  }

  function handleDelete() {
    if (!confirm("למחוק את המשחק? פעולה זו בלתי הפיכה.")) return;
    startTransition(async () => {
      await deleteGame(gameId);
      onGameDeleted();
    });
  }

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center gap-3 py-20">
        <Spinner size="md" />
        <span className="text-slate-500">טוען משחק…</span>
      </div>
    );
  }

  if (!data) return null;

  const { game, currentQuestion, currentQuestionId, players, totalQuestions } = data;
  const { status, current_question_index } = game;
  const questionNumber = current_question_index + 1;
  const isLastQuestion = questionNumber >= totalQuestions;
  const playerCount = players.length;

  return (
    <div className="space-y-5 w-full max-w-lg mx-auto">

      {/* Status bar */}
      <GlassCard className="p-5" elevated>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-800">מצב נוכחי</h2>
          <Badge variant={STATUS_BADGE[status]}>
            {STATUS_LABELS[status]}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
          <span>👥 {playerCount} שחקנים</span>
          {totalQuestions > 0 && (
            <span>📋 שאלה {questionNumber} / {totalQuestions}</span>
          )}
          {(status === "answering" || status === "leaderboard") && (
            <span className={answeredCount === playerCount && playerCount > 0
              ? "text-[#15803d] font-semibold"
              : ""}>
              ✅ {answeredCount} / {playerCount} ענו
            </span>
          )}
        </div>
      </GlassCard>

      {/* Current question preview */}
      <AnimatePresence mode="wait">
        {currentQuestion && (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <GlassCard className="p-5">
              <p className="text-xs font-semibold text-[#0070d1] mb-2">שאלה נוכחית</p>
              <p className="font-bold text-slate-800 text-base leading-snug mb-3">
                {currentQuestion.text}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(currentQuestion.options as string[]).map((opt, i) => (
                  <div
                    key={i}
                    className={[
                      "px-3 py-2 rounded-xl text-sm font-medium text-right",
                      i === currentQuestion.correct_option_index
                        ? "bg-[#22c55e]/15 text-[#15803d] border border-[#22c55e]/30"
                        : "bg-slate-50 text-slate-600 border border-slate-100",
                    ].join(" ")}
                  >
                    {["א","ב","ג","ד"][i]}. {opt}
                    {i === currentQuestion.correct_option_index && " ✓"}
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Players list */}
      {players.length > 0 && (
        <GlassCard className="p-4">
          <p className="text-xs font-semibold text-slate-500 mb-3">שחקנים ({playerCount})</p>
          <div className="flex flex-wrap gap-2">
            {players.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-100 shadow-sm"
              >
                <span>{p.avatar}</span>
                <span className="text-sm font-medium text-slate-700">{p.nickname}</span>
                <span className="text-xs text-[#0070d1] font-bold">{p.score.toLocaleString("he-IL")}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* ── Action buttons ── */}
      <GlassCard className="p-5 space-y-3" elevated>
        <p className="text-xs font-semibold text-slate-500 mb-1">פעולות מנחה</p>

        {status === "lobby" && (
          <Button size="lg" fullWidth loading={isPending} onClick={() => act("start")}>
            ▶️ התחל משחק
          </Button>
        )}

        {status === "reading" && (
          <Button size="lg" fullWidth loading={isPending} onClick={() => act("show-timer")}>
            ⏱ הצג תשובות + התחל טיימר
          </Button>
        )}

        {status === "answering" && (
          <Button size="lg" fullWidth loading={isPending} onClick={() => act("show-leaderboard")}>
            🏆 עצור וסגור תשובות
          </Button>
        )}

        {status === "leaderboard" && (
          <>
            {!isLastQuestion && (
              <Button size="lg" fullWidth loading={isPending} onClick={() => act("next-question")}>
                ➡️ שאלה הבאה
              </Button>
            )}
            <Button
              size="lg"
              fullWidth
              variant={isLastQuestion ? "primary" : "secondary"}
              loading={isPending}
              onClick={() => act("finish")}
            >
              🎉 סיים משחק
            </Button>
          </>
        )}

        {status === "finished" && (
          <div className="text-center py-3">
            <p className="text-slate-500 font-medium">המשחק הסתיים 🎉</p>
          </div>
        )}
      </GlassCard>

      {/* Danger zone */}
      <div className="pt-2">
        <Button
          variant="danger"
          size="sm"
          fullWidth
          loading={isPending}
          onClick={handleDelete}
        >
          🗑 מחק משחק
        </Button>
      </div>
    </div>
  );
}
