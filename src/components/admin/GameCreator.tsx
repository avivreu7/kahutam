"use client";

import { useEffect, useState, useTransition } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { GlassCard, Button, Spinner } from "@/components/ui";
import {
  fetchAllQuestions,
  createGame,
  deleteQuestion,
  updateQuestionTimeLimit,
} from "@/app/actions/admin";
import QuestionForm from "./QuestionForm";
import type { Question } from "@/types/game";

const TIME_OPTIONS = [10, 15, 20, 30];

interface Props {
  onGameCreated: (gameId: string) => void;
}

export default function GameCreator({ onGameCreated }: Props) {
  const [questions, setQuestions]     = useState<Question[]>([]);
  const [selected, setSelected]       = useState<string[]>([]);
  const [orderedSel, setOrderedSel]   = useState<Question[]>([]);
  const [loading, setLoading]         = useState(true);
  const [isPending, startTransition]  = useTransition();
  const [error, setError]             = useState("");
  // Track which questions are being mutated (for spinner on their row)
  const [busyIds, setBusyIds]         = useState<Set<string>>(new Set());

  function loadQuestions() {
    return fetchAllQuestions().then((qs) => setQuestions(qs as Question[]));
  }

  useEffect(() => {
    loadQuestions().finally(() => setLoading(false));
  }, []);

  // ── Selection ─────────────────────────────────────────────
  function toggleQuestion(q: Question) {
    setSelected((prev) => {
      const next = prev.includes(q.id)
        ? prev.filter((id) => id !== q.id)
        : [...prev, q.id];
      setOrderedSel(
        next.map((id) => questions.find((qq) => qq.id === id)!).filter(Boolean)
      );
      return next;
    });
  }

  // ── Delete ────────────────────────────────────────────────
  function handleDelete(e: React.MouseEvent, q: Question) {
    e.stopPropagation();
    if (!confirm(`למחוק את השאלה "${q.text}"?`)) return;

    setBusyIds((s) => new Set([...s, q.id]));
    startTransition(async () => {
      try {
        await deleteQuestion(q.id);
        setSelected((prev) => prev.filter((id) => id !== q.id));
        setOrderedSel((prev) => prev.filter((qq) => qq.id !== q.id));
        await loadQuestions();
      } finally {
        setBusyIds((s) => { const n = new Set(s); n.delete(q.id); return n; });
      }
    });
  }

  // ── Time limit cycle ──────────────────────────────────────
  function handleCycleTime(e: React.MouseEvent, q: Question) {
    e.stopPropagation();
    const currentIdx = TIME_OPTIONS.indexOf(q.time_limit);
    const nextTime   = TIME_OPTIONS[(currentIdx + 1) % TIME_OPTIONS.length];

    // Optimistic update
    setQuestions((prev) =>
      prev.map((qq) => qq.id === q.id ? { ...qq, time_limit: nextTime } : qq)
    );
    setOrderedSel((prev) =>
      prev.map((qq) => qq.id === q.id ? { ...qq, time_limit: nextTime } : qq)
    );

    setBusyIds((s) => new Set([...s, q.id + "_time"]));
    startTransition(async () => {
      try {
        await updateQuestionTimeLimit(q.id, nextTime);
      } catch {
        // Revert on error
        await loadQuestions();
      } finally {
        setBusyIds((s) => { const n = new Set(s); n.delete(q.id + "_time"); return n; });
      }
    });
  }

  // ── Create game ───────────────────────────────────────────
  function handleCreate() {
    if (selected.length === 0) { setError("יש לבחור לפחות שאלה אחת"); return; }
    setError("");
    startTransition(async () => {
      try {
        const { gameId } = await createGame(orderedSel.map((q) => q.id));
        onGameCreated(gameId);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "שגיאה ביצירת משחק");
      }
    });
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center gap-3">
        <Spinner size="md" />
        <span className="text-slate-500">טוען שאלות…</span>
      </div>
    );
  }

  return (
    <div className="space-y-5 w-full max-w-lg mx-auto">

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">בחירת שאלות</h2>
        <span className="text-sm text-slate-400">{selected.length} / {questions.length} נבחרו</span>
      </div>

      {/* Question pool */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {questions.map((q, i) => {
            const isSelected = selected.includes(q.id);
            const isBusy     = busyIds.has(q.id);
            return (
              <motion.div
                key={q.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={[
                  "flex items-start gap-3 p-4 rounded-2xl border-2",
                  "transition-colors duration-150",
                  isSelected
                    ? "border-[#0070d1] bg-[#0070d1]/8"
                    : "border-slate-200 bg-white/70",
                  isBusy ? "opacity-50 pointer-events-none" : "",
                ].join(" ")}
              >
                {/* Checkbox — tap to select */}
                <button
                  type="button"
                  onClick={() => toggleQuestion(q)}
                  className={[
                    "shrink-0 mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center",
                    "transition-colors duration-150 select-none",
                    isSelected
                      ? "bg-[#0070d1] border-[#0070d1] text-white"
                      : "border-slate-300",
                  ].join(" ")}
                >
                  {isSelected && <span className="text-sm font-bold">✓</span>}
                </button>

                {/* Question text */}
                <button
                  type="button"
                  onClick={() => toggleQuestion(q)}
                  className="flex-1 text-right min-w-0"
                >
                  <p className="font-semibold text-slate-800 text-sm leading-snug">
                    {i + 1}. {q.text}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 truncate">
                    {(q.options as string[]).join(" · ")}
                  </p>
                </button>

                {/* Time limit badge — tap to cycle */}
                <button
                  type="button"
                  onClick={(e) => handleCycleTime(e, q)}
                  title="לחץ לשינוי זמן"
                  className={[
                    "shrink-0 min-h-11 min-w-11 px-3 rounded-xl text-sm font-bold border-2",
                    "transition-colors duration-150 select-none",
                    "border-slate-200 bg-white text-slate-600",
                    "hover:border-[#0070d1] hover:text-[#0070d1]",
                  ].join(" ")}
                >
                  {q.time_limit}ש
                </button>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, q)}
                  title="מחק שאלה"
                  className={[
                    "shrink-0 min-w-11 min-h-11 rounded-xl flex items-center justify-center",
                    "text-slate-300 hover:text-[#ef4444] hover:bg-[#ef4444]/10",
                    "transition-colors duration-150 select-none",
                  ].join(" ")}
                >
                  🗑
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {questions.length === 0 && (
          <p className="text-center text-slate-400 py-6 text-sm">
            אין שאלות — הוסף שאלה חדשה למטה
          </p>
        )}
      </div>

      {/* Ordered selection — drag to reorder */}
      <AnimatePresence>
        {orderedSel.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <GlassCard className="p-4" elevated>
              <p className="text-xs font-semibold text-slate-500 mb-3">
                סדר השאלות — גרור לשינוי
              </p>
              <Reorder.Group
                axis="y"
                values={orderedSel}
                onReorder={setOrderedSel}
                className="space-y-2"
              >
                {orderedSel.map((q, i) => (
                  <Reorder.Item
                    key={q.id}
                    value={q}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-grab active:cursor-grabbing bg-white border border-slate-100 shadow-sm select-none"
                  >
                    <span className="w-6 h-6 rounded-lg bg-[#0070d1] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm font-medium text-slate-700 text-right truncate">
                      {q.text}
                    </span>
                    <span className="text-xs font-bold text-slate-400 shrink-0">{q.time_limit}ש</span>
                    <span className="text-slate-300 text-lg shrink-0">⠿</span>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-sm text-[#ef4444] font-medium text-center">{error}</p>
      )}

      <Button
        size="lg"
        fullWidth
        onClick={handleCreate}
        loading={isPending}
        disabled={selected.length === 0}
      >
        צור משחק עם {selected.length} שאלות ←
      </Button>

      {/* Add new question */}
      <div className="pt-2 border-t border-slate-200">
        <QuestionForm onAdded={loadQuestions} />
      </div>
    </div>
  );
}
