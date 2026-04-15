"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Logo, PageShell, GlassCard, Button, Spinner } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { loadSession, saveSession, clearSession } from "@/lib/session";
import type { PlayerSession } from "@/types/game";

const AVATARS = [
  "🦁","🦊","🐯","🐸",
  "🦄","🐺","🐬","🦋",
  "🐉","🦅","🐧","🎮",
  "🚀","⭐","🎯","🏆",
];

type PageState =
  | "checking"   // מחפש משחק פעיל
  | "no-game"    // אין משחק פעיל כרגע
  | "reconnect"  // יש סשן קיים למשחק הפעיל
  | "register";  // הצג טופס הרשמה

export default function HomePage() {
  const router = useRouter();

  const [pageState, setPageState]     = useState<PageState>("checking");
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [existingSession, setExistingSession] = useState<PlayerSession | null>(null);

  // Form state
  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar]     = useState(AVATARS[0]);
  const [error, setError]       = useState("");
  const [joining, setJoining]   = useState(false);

  // ── Boot: find active game + check session ────────────────
  useEffect(() => {
    const supabase = createClient();

    supabase
      .from("games")
      .select("id, status")
      .neq("status", "finished")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data: game }) => {
        if (!game) {
          setPageState("no-game");
          return;
        }

        setActiveGameId(game.id);

        const session = loadSession();
        if (session && session.gameId === game.id) {
          // Valid session for the current active game
          setExistingSession(session);
          setPageState("reconnect");
        } else {
          // No session or stale session from a different game
          clearSession();
          setPageState("register");
        }
      });
  }, []);

  // ── Register ──────────────────────────────────────────────
  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const name = nickname.trim();
    if (!name)        { setError("הכנס כינוי");      return; }
    if (name.length < 2) { setError("כינוי קצר מדי"); return; }
    if (!activeGameId)    { setError("אין משחק פעיל"); return; }

    setJoining(true);
    setError("");

    try {
      const supabase = createClient();

      // Re-check game status right before inserting
      const { data: game } = await supabase
        .from("games")
        .select("status")
        .eq("id", activeGameId)
        .single();

      if (!game)                    { setError("המשחק לא נמצא");   return; }
      if (game.status !== "lobby")  { setError("המשחק כבר התחיל — פנה למנחה"); return; }

      const { data: player, error: insertErr } = await supabase
        .from("players")
        .insert({ game_id: activeGameId, nickname: name, avatar })
        .select()
        .single();

      if (insertErr || !player) {
        setError("שגיאה בהצטרפות, נסה שוב");
        return;
      }

      saveSession({
        gameId:   activeGameId,
        playerId: player.id,
        nickname: player.nickname,
        avatar:   player.avatar,
      });

      router.push(`/game/${activeGameId}`);
    } catch {
      setError("שגיאת רשת, נסה שוב");
    } finally {
      setJoining(false);
    }
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <PageShell>
      <div className="flex flex-1 flex-col items-center justify-start px-4 pt-10 pb-12">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-8"
        >
          <Logo size="lg" />
          <p className="mt-2 text-slate-500 text-base font-medium">
            משחק הטריוויה הכי מהיר
          </p>
        </motion.div>

        <AnimatePresence mode="wait">

          {/* ── Checking ── */}
          {pageState === "checking" && (
            <motion.div
              key="checking"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 mt-10"
            >
              <Spinner size="lg" />
              <p className="text-slate-400 text-sm">מחפש משחק פעיל…</p>
            </motion.div>
          )}

          {/* ── No game ── */}
          {pageState === "no-game" && (
            <motion.div
              key="no-game"
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            >
              <GlassCard className="p-8 text-center space-y-3 max-w-xs" elevated>
                <span className="text-5xl block">😴</span>
                <p className="font-bold text-slate-700 text-lg">אין משחק פעיל כרגע</p>
                <p className="text-slate-400 text-sm">המתן למנחה שיפתח משחק חדש</p>
              </GlassCard>
            </motion.div>
          )}

          {/* ── Reconnect ── */}
          {pageState === "reconnect" && existingSession && (
            <motion.div
              key="reconnect"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm space-y-4"
            >
              <GlassCard className="p-6 text-center space-y-4 border-[#0070d1]/20 bg-[#0070d1]/5" elevated>
                <span className="text-5xl block">{existingSession.avatar}</span>
                <div>
                  <p className="font-bold text-slate-800 text-xl">{existingSession.nickname}</p>
                  <p className="text-slate-500 text-sm mt-1">חזור למשחק הפעיל</p>
                </div>
                <Button
                  size="lg"
                  fullWidth
                  onClick={() => router.push(`/game/${existingSession.gameId}`)}
                >
                  חזור למשחק ←
                </Button>
              </GlassCard>

              <button
                onClick={() => { clearSession(); setExistingSession(null); setPageState("register"); }}
                className="w-full text-sm text-slate-400 text-center py-2"
              >
                הצטרף כשחקן חדש
              </button>
            </motion.div>
          )}

          {/* ── Register ── */}
          {pageState === "register" && (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm"
            >
              <GlassCard className="p-6 space-y-5" elevated>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-slate-800">הצטרפות למשחק</h2>
                  <p className="text-slate-400 text-sm mt-1">בחר כינוי ואווטאר</p>
                </div>

                <form onSubmit={handleJoin} className="space-y-5">
                  {/* Nickname */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2">
                      כינוי
                    </label>
                    <input
                      type="text"
                      maxLength={20}
                      placeholder="למשל: אביב 🔥"
                      autoFocus
                      value={nickname}
                      onChange={(e) => { setNickname(e.target.value); setError(""); }}
                      className={[
                        "w-full h-14 px-4 text-lg rounded-2xl border-2 bg-white/80 outline-none",
                        "transition-all duration-200 text-right",
                        error ? "border-[#ef4444]" : "border-slate-200 focus:border-[#0070d1]",
                        "placeholder:text-slate-300",
                      ].join(" ")}
                    />
                    <AnimatePresence>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="text-sm text-[#ef4444] mt-1.5 font-medium"
                        >
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Avatar grid */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-3">
                      אווטאר
                    </label>
                    <div className="grid grid-cols-4 gap-2.5">
                      {AVATARS.map((em) => (
                        <motion.button
                          key={em}
                          type="button"
                          whileTap={{ scale: 0.88 }}
                          onClick={() => setAvatar(em)}
                          className={[
                            "aspect-square flex items-center justify-center text-3xl rounded-2xl",
                            "border-2 transition-all duration-150 select-none",
                            avatar === em
                              ? "border-[#0070d1] bg-[#0070d1]/10 shadow-md"
                              : "border-slate-200 bg-white/70",
                          ].join(" ")}
                        >
                          {em}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  <motion.div
                    key={avatar + nickname}
                    initial={{ scale: 0.95, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100"
                  >
                    <span className="text-3xl">{avatar}</span>
                    <span className="font-semibold text-slate-700 text-lg truncate">
                      {nickname || "הכינוי שלך"}
                    </span>
                  </motion.div>

                  <Button
                    type="submit"
                    size="lg"
                    fullWidth
                    loading={joining}
                    disabled={!nickname.trim()}
                  >
                    הצטרף למשחק ←
                  </Button>
                </form>
              </GlassCard>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </PageShell>
  );
}
