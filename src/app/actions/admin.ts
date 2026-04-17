"use server";

import { cookies } from "next/headers";
import { adminSupabase } from "@/lib/supabase/admin";

// ─── Auth ──────────────────────────────────────────────────────────────────────

const ADMIN_COOKIE = "kahutam_admin";

/** Called by PinScreen — verifies PIN and sets httpOnly cookie */
export async function verifyAdminPin(pin: string): Promise<boolean> {
  const correct = process.env.ADMIN_PIN ?? "101140";
  if (pin !== correct) return false;

  const store = await cookies();
  store.set(ADMIN_COOKIE, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  });
  return true;
}

/** Clears the admin session cookie */
export async function logoutAdmin(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

/** Guard — throws if request is not authenticated */
async function requireAdmin() {
  const store = await cookies();
  if (store.get(ADMIN_COOKIE)?.value !== "1") {
    throw new Error("גישה לא מורשית");
  }
}

// ─── Create Game ───────────────────────────────────────────────────────────────

export async function createGame(questionIds: string[]): Promise<{ gameId: string }> {
  await requireAdmin();
  if (questionIds.length === 0) throw new Error("יש לבחור לפחות שאלה אחת");

  const { data: game, error: gameErr } = await adminSupabase
    .from("games")
    .insert({ status: "lobby", current_question_index: 0 })
    .select()
    .single();

  if (gameErr || !game) throw new Error("שגיאה ביצירת משחק");

  const rows = questionIds.map((qId, i) => ({
    game_id: game.id,
    question_id: qId,
    order_index: i,
  }));

  const { error: gqErr } = await adminSupabase.from("game_questions").insert(rows);
  if (gqErr) throw new Error("שגיאה בשמירת שאלות");

  return { gameId: game.id };
}

// ─── Game State Machine ────────────────────────────────────────────────────────

export type AdminAction =
  | "start"
  | "show-timer"
  | "show-leaderboard"
  | "next-question"
  | "finish";

export async function advanceGame(gameId: string, action: AdminAction): Promise<void> {
  await requireAdmin();

  switch (action) {
    case "start":
      await adminSupabase.from("games")
        .update({ status: "reading", current_question_index: 0, question_start_time: null })
        .eq("id", gameId);
      break;

    case "show-timer":
      await adminSupabase.from("games")
        .update({ status: "answering", question_start_time: new Date().toISOString() })
        .eq("id", gameId);
      break;

    case "show-leaderboard": {
      // On the last question, skip the leaderboard and go straight to finished
      const [gameRes, countRes] = await Promise.all([
        adminSupabase.from("games")
          .select("current_question_index")
          .eq("id", gameId)
          .single(),
        adminSupabase.from("game_questions")
          .select("id", { count: "exact", head: true })
          .eq("game_id", gameId),
      ]);
      if (!gameRes.data) throw new Error("Game not found");
      const isLast = (countRes.count ?? 0) > 0 &&
        gameRes.data.current_question_index + 1 >= (countRes.count ?? 0);
      await adminSupabase.from("games")
        .update({ status: isLast ? "finished" : "leaderboard" })
        .eq("id", gameId);
      break;
    }

    case "next-question": {
      const { data: game } = await adminSupabase.from("games")
        .select("current_question_index").eq("id", gameId).single();
      if (!game) throw new Error("Game not found");
      await adminSupabase.from("games")
        .update({ status: "reading", current_question_index: game.current_question_index + 1, question_start_time: null })
        .eq("id", gameId);
      break;
    }

    case "finish":
      await adminSupabase.from("games")
        .update({ status: "finished" })
        .eq("id", gameId);
      break;
  }
}

// ─── Delete Game ───────────────────────────────────────────────────────────────

export async function deleteGame(gameId: string): Promise<void> {
  await requireAdmin();
  await adminSupabase.from("games").delete().eq("id", gameId);
}

// ─── Questions ─────────────────────────────────────────────────────────────────

export async function fetchAllQuestions() {
  await requireAdmin();
  const { data, error } = await adminSupabase
    .from("questions").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function addQuestion(params: {
  text: string;
  options: string[];
  correct_option_index: number;
  time_limit: number;
}): Promise<void> {
  await requireAdmin();
  const { error } = await adminSupabase.from("questions").insert(params);
  if (error) throw new Error("שגיאה בשמירת שאלה");
}

export async function deleteQuestion(questionId: string): Promise<void> {
  await requireAdmin();
  const { error } = await adminSupabase.from("questions").delete().eq("id", questionId);
  if (error) throw new Error("שגיאה במחיקת שאלה");
}

export async function updateQuestionTimeLimit(questionId: string, timeLimit: number): Promise<void> {
  await requireAdmin();
  const { error } = await adminSupabase.from("questions").update({ time_limit: timeLimit }).eq("id", questionId);
  if (error) throw new Error("שגיאה בעדכון זמן");
}
