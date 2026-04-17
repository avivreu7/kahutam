"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { PageShell, Spinner, GlassCard } from "@/components/ui";
import LobbyView      from "@/components/game/LobbyView";
import ReadingView    from "@/components/game/ReadingView";
import AnsweringView  from "@/components/game/AnsweringView";
import LeaderboardView from "@/components/game/LeaderboardView";
import FinishedView   from "@/components/game/FinishedView";
import { useGameState } from "@/hooks/useGameState";
import { loadSession, clearSession } from "@/lib/session";
import type { PlayerSession } from "@/types/game";

interface Props {
  gameId: string;
}

const VIEW_TRANSITIONS = {
  initial:  { opacity: 0, y: 24 },
  animate:  { opacity: 1, y: 0 },
  exit:     { opacity: 0, y: -24 },
  transition: { duration: 0.3 },
} as const;

export default function GameClient({ gameId }: Props) {
  const router = useRouter();
  const [session, setSession] = useState<PlayerSession | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Load session from localStorage (client-only)
  useEffect(() => {
    const s = loadSession();
    if (!s || s.gameId !== gameId) {
      // No session for this game – send back to join page
      router.replace(`/join/${gameId}`);
      return;
    }
    setSession(s);
    setSessionChecked(true);
  }, [gameId, router]);

  const { data, error, isLoading } = useGameState(
    sessionChecked ? gameId : null,
    session?.playerId ?? null
  );

  // ── Loading / error states ────────────────────────────────
  if (!sessionChecked) return null;

  if (isLoading && !data) {
    return (
      <PageShell>
        <div className="flex flex-1 items-center justify-center">
          <Spinner size="lg" />
        </div>
      </PageShell>
    );
  }

  if (error || !data) {
    return (
      <PageShell>
        <div className="flex flex-1 items-center justify-center px-4">
          <GlassCard className="p-8 text-center space-y-4 max-w-xs" elevated>
            <span className="text-4xl">⚠️</span>
            <p className="font-bold text-slate-700">לא ניתן להתחבר למשחק</p>
            <p className="text-sm text-slate-400">בדוק חיבור לאינטרנט ונסה שוב</p>
          </GlassCard>
        </div>
      </PageShell>
    );
  }

  const { game, currentQuestion, currentQuestionId, players, myAnswers, totalQuestions } = data;
  const playerId = session!.playerId;

  // My answer for the current question
  const myCurrentAnswer = currentQuestionId
    ? (myAnswers.find((a) => a.question_id === currentQuestionId) ?? null)
    : null;

  const questionNumber = game.current_question_index + 1;
  const myPlayer   = players.find((p) => p.id === playerId);
  const myStreak   = myPlayer?.current_streak ?? 0;

  // ── Render based on game status ───────────────────────────
  return (
    <PageShell>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${game.status}-${game.current_question_index}`}
          className="flex flex-1 flex-col"
          {...VIEW_TRANSITIONS}
        >
          {game.status === "lobby" && (
            <LobbyView
              players={players}
              currentPlayerId={playerId}
              nickname={session!.nickname}
              avatar={session!.avatar}
            />
          )}

          {game.status === "reading" && currentQuestion && (
            <ReadingView
              question={currentQuestion}
              questionNumber={questionNumber}
              totalQuestions={totalQuestions}
              playerStreak={myStreak}
            />
          )}

          {game.status === "answering" && currentQuestion && currentQuestionId && game.question_start_time && (
            <AnsweringView
              question={currentQuestion}
              questionId={currentQuestionId}
              gameId={gameId}
              playerId={playerId}
              questionNumber={questionNumber}
              totalQuestions={totalQuestions}
              questionStartTime={game.question_start_time}
              existingAnswer={myCurrentAnswer}
            />
          )}

          {game.status === "leaderboard" && (
            <LeaderboardView
              players={players}
              currentPlayerId={playerId}
              myAnswerForCurrentQuestion={myCurrentAnswer}
              currentQuestion={currentQuestion}
              questionNumber={questionNumber}
              totalQuestions={totalQuestions}
            />
          )}

          {game.status === "finished" && (
            <FinishedView
              players={players}
              currentPlayerId={playerId}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </PageShell>
  );
}
