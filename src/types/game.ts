/**
 * Convenience type aliases derived from the Database schema.
 * Import these throughout the app instead of the raw DB row types.
 */
import type { Database, GameStatus } from "./database";

export type { GameStatus };

export type Game          = Database["public"]["Tables"]["games"]["Row"];
export type Question      = Database["public"]["Tables"]["questions"]["Row"];
export type GameQuestion  = Database["public"]["Tables"]["game_questions"]["Row"];
export type Player        = Database["public"]["Tables"]["players"]["Row"];
export type Answer        = Database["public"]["Tables"]["answers"]["Row"];

/** A question enriched with its position inside a game */
export type GameQuestionWithQuestion = GameQuestion & {
  question: Question;
};

/** A game with its ordered question list pre-joined */
export type GameWithQuestions = Game & {
  game_questions: GameQuestionWithQuestion[];
};

/** Leaderboard entry – player + rank */
export type LeaderboardEntry = Player & {
  rank: number;
};

/** Payload stored in localStorage to reconnect a player */
export type PlayerSession = {
  gameId: string;
  playerId: string;
  nickname: string;
  avatar: string;
};

/** Answer option colours (PlayStation-inspired) */
export const OPTION_COLORS = [
  { bg: "bg-[#0070d1]",   border: "border-[#005aaa]",  label: "כחול"  },  // PS Blue
  { bg: "bg-[#d63384]",   border: "border-[#b02a6f]",  label: "ורוד"  },  // PS Pink
  { bg: "bg-[#198754]",   border: "border-[#146c43]",  label: "ירוק"  },  // PS Green
  { bg: "bg-[#fd7e14]",   border: "border-[#dc6a0e]",  label: "כתום"  },  // PS Orange
] as const;

/** Streak multiplier table */
export const STREAK_MULTIPLIERS: Record<number, number> = {
  0: 1.0,
  1: 1.0,
  2: 1.2,
  3: 1.5,
  4: 1.8,
  5: 2.0,
};

export function getStreakMultiplier(streak: number): number {
  if (streak <= 0) return 1.0;
  if (streak >= 5) return 2.0;
  return STREAK_MULTIPLIERS[streak] ?? 1.0;
}

/**
 * Calculate points for a correct answer.
 * @param remainingMs  Milliseconds remaining on the timer when answered
 * @param totalMs      Total timer duration in milliseconds
 * @param streak       Current correct-answer streak (including this answer)
 */
export function calculatePoints(
  remainingMs: number,
  totalMs: number,
  streak: number
): number {
  const base = Math.round(1000 * (remainingMs / totalMs));
  const multiplier = getStreakMultiplier(streak);
  return Math.round(base * multiplier);
}
