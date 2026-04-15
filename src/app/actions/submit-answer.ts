"use server";

import { adminSupabase } from "@/lib/supabase/admin";
import { calculatePoints } from "@/types/game";

interface SubmitAnswerParams {
  playerId: string;
  questionId: string;
  gameId: string;
  /** null = player timed out without selecting */
  selectedOption: number | null;
  /** Client-measured ms since question_start_time */
  responseTimeMs: number;
}

export interface SubmitAnswerResult {
  isCorrect: boolean;
  pointsEarned: number;
  newStreak: number;
  newScore: number;
}

export async function submitAnswer(
  params: SubmitAnswerParams
): Promise<SubmitAnswerResult> {
  const { playerId, questionId, gameId, selectedOption, responseTimeMs } = params;

  // 1. Fetch question + game in parallel (server-side – bypasses RLS)
  const [{ data: question }, { data: game }, { data: player }] =
    await Promise.all([
      adminSupabase
        .from("questions")
        .select("correct_option_index, time_limit")
        .eq("id", questionId)
        .single(),
      adminSupabase
        .from("games")
        .select("question_start_time")
        .eq("id", gameId)
        .single(),
      adminSupabase
        .from("players")
        .select("score, current_streak")
        .eq("id", playerId)
        .single(),
    ]);

  if (!question || !game || !player) throw new Error("Data not found");

  // 2. Server-side timing verification
  const totalTimeMs = question.time_limit * 1000;
  const serverElapsedMs = game.question_start_time
    ? Date.now() - new Date(game.question_start_time).getTime()
    : responseTimeMs;
  // Use the larger of client/server elapsed to prevent early-submit cheating
  const trustedElapsedMs = Math.max(responseTimeMs, serverElapsedMs - 200); // 200ms network tolerance
  const remainingMs = Math.max(0, totalTimeMs - trustedElapsedMs);

  // 3. Calculate correctness and points
  const isCorrect =
    selectedOption !== null && selectedOption === question.correct_option_index;
  const newStreak = isCorrect ? player.current_streak + 1 : 0;
  const pointsEarned = isCorrect
    ? calculatePoints(remainingMs, totalTimeMs, newStreak)
    : 0;
  const newScore = player.score + pointsEarned;

  // 4. Upsert answer (idempotent – safe if called twice)
  await adminSupabase.from("answers").upsert(
    {
      player_id: playerId,
      question_id: questionId,
      game_id: gameId,
      selected_option: selectedOption,
      is_correct: isCorrect,
      response_time_ms: Math.round(trustedElapsedMs),
      points_earned: pointsEarned,
    },
    { onConflict: "player_id,question_id" }
  );

  // 5. Update player score + streak
  await adminSupabase
    .from("players")
    .update({ score: newScore, current_streak: newStreak })
    .eq("id", playerId);

  return { isCorrect, pointsEarned, newStreak, newScore };
}
