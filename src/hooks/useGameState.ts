"use client";

import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import type { Game, Question, Player, Answer } from "@/types/game";

export type GameStateData = {
  game: Game;
  currentQuestion: Question | null;
  currentQuestionId: string | null;
  players: Player[];
  myAnswers: Answer[];
  totalQuestions: number;
};

async function fetchGameState([
  ,
  gameId,
  playerId,
]: [string, string, string | null]): Promise<GameStateData> {
  const supabase = createClient();

  // 1. Game record
  const { data: game, error: gameError } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .single();

  if (gameError || !game) throw new Error("Game not found");

  // 2. Parallel: current question, players list, this player's answers, total Q count
  const [questionRes, playersRes, answersRes, countRes] = await Promise.all([
    supabase
      .from("game_questions")
      .select("question_id, question:questions(*)")
      .eq("game_id", gameId)
      .eq("order_index", game.current_question_index)
      .maybeSingle(),

    supabase
      .from("players")
      .select("*")
      .eq("game_id", gameId)
      .order("score", { ascending: false }),

    playerId
      ? supabase.from("answers").select("*").eq("player_id", playerId)
      : Promise.resolve({ data: [] as Answer[], error: null }),

    supabase
      .from("game_questions")
      .select("id", { count: "exact", head: true })
      .eq("game_id", gameId),
  ]);

  // Supabase join returns { question_id, question: {...} }
  const qRow = questionRes.data as
    | { question_id: string; question: Question }
    | null;

  return {
    game: game as Game,
    currentQuestion: qRow?.question ?? null,
    currentQuestionId: qRow?.question_id ?? null,
    players: (playersRes.data ?? []) as Player[],
    myAnswers: (answersRes.data ?? []) as Answer[],
    totalQuestions: countRes.count ?? 0,
  };
}

export function useGameState(
  gameId: string | null,
  playerId: string | null
) {
  return useSWR<GameStateData>(
    gameId ? ["gameState", gameId, playerId] : null,
    fetchGameState,
    {
      refreshInterval: 1000,
      revalidateOnFocus: false,
      refreshWhenHidden: false,
      dedupingInterval: 800,
    }
  );
}
