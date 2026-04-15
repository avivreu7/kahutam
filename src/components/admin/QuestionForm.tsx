"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard, Button } from "@/components/ui";
import { addQuestion } from "@/app/actions/admin";

interface Props {
  onAdded: () => void;
}

const EMPTY = ["", "", "", ""];

export default function QuestionForm({ onAdded }: Props) {
  const [open, setOpen]               = useState(false);
  const [text, setText]               = useState("");
  const [options, setOptions]         = useState<string[]>([...EMPTY]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [timeLimit, setTimeLimit]     = useState(20);
  const [error, setError]             = useState("");
  const [isPending, startTransition]  = useTransition();

  function setOption(i: number, val: string) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? val : o)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim())                  { setError("הכנס טקסט שאלה");    return; }
    if (options.some((o) => !o.trim())) { setError("מלא את כל 4 האפשרויות"); return; }
    setError("");

    startTransition(async () => {
      try {
        await addQuestion({
          text: text.trim(),
          options: options.map((o) => o.trim()),
          correct_option_index: correctIndex,
          time_limit: timeLimit,
        });
        // Reset
        setText("");
        setOptions([...EMPTY]);
        setCorrectIndex(0);
        setTimeLimit(20);
        setOpen(false);
        onAdded();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "שגיאה בשמירת שאלה");
      }
    });
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-sm font-semibold text-[#0070d1] flex items-center gap-1"
      >
        {open ? "▲ סגור" : "＋ הוסף שאלה חדשה"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-3"
          >
            <GlassCard className="p-5" elevated>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Question text */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">שאלה</label>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="מה הבירה של צרפת?"
                    className="w-full h-11 px-3 rounded-xl border-2 border-slate-200 focus:border-[#0070d1] outline-none text-right text-base bg-white/80"
                  />
                </div>

                {/* Options */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-500">
                    אפשרויות (סמן את הנכונה)
                  </label>
                  {options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCorrectIndex(i)}
                        className={[
                          "shrink-0 w-7 h-7 rounded-lg border-2 text-sm font-bold transition-colors",
                          correctIndex === i
                            ? "bg-[#22c55e] border-[#22c55e] text-white"
                            : "border-slate-300 text-slate-400",
                        ].join(" ")}
                      >
                        {["א","ב","ג","ד"][i]}
                      </button>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => setOption(i, e.target.value)}
                        placeholder={`אפשרות ${["א","ב","ג","ד"][i]}`}
                        className="flex-1 h-11 px-3 rounded-xl border-2 border-slate-200 focus:border-[#0070d1] outline-none text-right text-base bg-white/80"
                      />
                    </div>
                  ))}
                </div>

                {/* Time limit */}
                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold text-slate-500 shrink-0">זמן (שניות)</label>
                  {[10, 15, 20, 30].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTimeLimit(t)}
                      className={[
                        "h-9 px-3 rounded-xl border-2 text-sm font-bold transition-colors",
                        timeLimit === t
                          ? "bg-[#0070d1] border-[#0070d1] text-white"
                          : "border-slate-200 text-slate-500",
                      ].join(" ")}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {error && (
                  <p className="text-sm text-[#ef4444] font-medium">{error}</p>
                )}

                <div className="flex gap-2">
                  <Button type="submit" size="sm" fullWidth loading={isPending}>
                    שמור שאלה
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
                    ביטול
                  </Button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
