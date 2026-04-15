"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageShell, Logo, Button, Spinner } from "@/components/ui";
import PinScreen      from "@/components/admin/PinScreen";
import GameCreator    from "@/components/admin/GameCreator";
import GameController from "@/components/admin/GameController";
import { createClient } from "@/lib/supabase/client";
import { logoutAdmin } from "@/app/actions/admin";

const ADMIN_SESSION_KEY = "kahutam_admin_auth";

type AdminView = "pin" | "loading" | "create" | "control";

export default function AdminPage() {
  const [view, setView]       = useState<AdminView>("pin");
  const [gameId, setGameId]   = useState<string | null>(null);

  // ── Auth check ────────────────────────────────────────────
  useEffect(() => {
    if (sessionStorage.getItem(ADMIN_SESSION_KEY) === "1") {
      bootDashboard();
    }
  }, []);

  function handlePinSuccess() {
    sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
    bootDashboard();
  }

  function handleLogout() {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    logoutAdmin(); // clear httpOnly cookie
    setView("pin");
    setGameId(null);
  }

  // ── Find active game ──────────────────────────────────────
  async function bootDashboard() {
    setView("loading");
    const supabase = createClient();
    const { data: game } = await supabase
      .from("games")
      .select("id, status")
      .neq("status", "finished")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (game) {
      setGameId(game.id);
      setView("control");
    } else {
      setView("create");
    }
  }

  function handleGameCreated(id: string) {
    setGameId(id);
    setView("control");
  }

  function handleGameDeleted() {
    setGameId(null);
    setView("create");
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <PageShell>
      <div className="flex flex-1 flex-col min-h-screen">

        {/* Admin header (visible when authenticated) */}
        {view !== "pin" && (
          <header className="flex items-center justify-between px-5 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
              <span className="text-xs font-bold text-slate-400 border border-slate-200 rounded-lg px-2 py-0.5">
                ADMIN
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              🔒 יציאה
            </Button>
          </header>
        )}

        {/* Main content */}
        <main className="flex flex-1 flex-col px-4 pb-10 pt-4">
          <AnimatePresence mode="wait">

            {view === "pin" && (
              <motion.div
                key="pin"
                className="flex flex-1 flex-col"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                <PinScreen onSuccess={handlePinSuccess} />
              </motion.div>
            )}

            {view === "loading" && (
              <motion.div
                key="loading"
                className="flex flex-1 items-center justify-center gap-3"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                <Spinner size="lg" />
                <span className="text-slate-500">טוען לוח בקרה…</span>
              </motion.div>
            )}

            {view === "create" && (
              <motion.div
                key="create"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              >
                <div className="mb-6">
                  <h1 className="text-2xl font-extrabold text-slate-900">לוח בקרה</h1>
                  <p className="text-slate-500 mt-1">אין משחק פעיל — צור משחק חדש</p>
                </div>
                <GameCreator onGameCreated={handleGameCreated} />
              </motion.div>
            )}

            {view === "control" && gameId && (
              <motion.div
                key="control"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              >
                <div className="mb-6">
                  <h1 className="text-2xl font-extrabold text-slate-900">מצב מנחה</h1>
                  <p className="text-slate-400 text-xs mt-0.5 font-mono">{gameId}</p>
                </div>
                <GameController
                  gameId={gameId}
                  onGameDeleted={handleGameDeleted}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </PageShell>
  );
}
