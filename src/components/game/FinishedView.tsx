"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { GlassCard, LeaderboardRow, Button, Avatar } from "@/components/ui";
import { clearSession } from "@/lib/session";
import type { Player } from "@/types/game";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  players: Player[];
  currentPlayerId: string;
}

// 0=anticipation  1=3rd  2=2nd  3=winner  4=full leaderboard
type Phase = 0 | 1 | 2 | 3 | 4;

// ms each phase shows before advancing
const PHASE_MS: Record<0 | 1 | 2 | 3, number> = {
  0: 1400,
  1: 2800,
  2: 2800,
  3: 3200,
};

const PLACE_META = [
  {
    medal: "🥇", label: "המנצח.ת!",
    glow: "shadow-[0_0_40px_#fbbf24aa]",
    bg: "from-amber-50 to-yellow-100",
    border: "border-amber-300", text: "text-amber-700",
  },
  {
    medal: "🥈", label: "מקום שני",
    glow: "shadow-[0_0_28px_#94a3b8aa]",
    bg: "from-slate-50 to-slate-100",
    border: "border-slate-300", text: "text-slate-600",
  },
  {
    medal: "🥉", label: "מקום שלישי",
    glow: "shadow-[0_0_20px_#d97706aa]",
    bg: "from-orange-50 to-amber-50",
    border: "border-orange-200", text: "text-orange-700",
  },
] as const;

// reveal order: 3rd → 2nd → 1st (indices into players array)
const REVEAL_ORDER = [2, 1, 0] as const;

// ─── RevealCard (extracted — not nested inside FinishedView) ───────────────────

interface RevealCardProps {
  player: Player;
  meta: (typeof PLACE_META)[number];
  placeIndex: number; // 0=1st, 1=2nd, 2=3rd
  isCurrentPlayer: boolean;
}

function RevealCard({ player, meta, placeIndex, isCurrentPlayer }: RevealCardProps) {
  const isWinner = placeIndex === 0;

  return (
    <motion.div
      className="flex flex-1 flex-col items-center justify-center px-6 gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.p
        className={`text-base font-bold ${meta.text}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {meta.label}
      </motion.p>

      {/* Card — relative so the absolute flash stays contained */}
      <motion.div
        className={[
          "relative",
          `bg-linear-to-b ${meta.bg} border-2 ${meta.border}`,
          `${meta.glow} rounded-3xl p-8 flex flex-col items-center gap-4 w-full max-w-xs`,
        ].join(" ")}
        initial={isWinner
          ? { opacity: 0, scale: 0.4, y: -80 }
          : { opacity: 0, scale: 0.7, y: 60 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: isWinner ? 180 : 260,
          damping: isWinner ? 14 : 20,
          delay: 0.1,
        }}
      >
        <motion.span
          className={isWinner ? "text-7xl" : "text-5xl"}
          animate={isWinner
            ? { rotate: [-8, 8, -8], scale: [1, 1.1, 1] }
            : { rotate: [-4, 4, -4] }}
          transition={{ duration: isWinner ? 1.4 : 2, repeat: Infinity }}
        >
          {meta.medal}
        </motion.span>

        <Avatar emoji={player.avatar} size={isWinner ? "xl" : "lg"} />

        <p className={`font-extrabold text-center ${meta.text} ${isWinner ? "text-2xl" : "text-xl"}`}>
          {player.nickname}
        </p>

        <motion.p
          className="text-slate-600 font-bold text-lg tabular-nums"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {player.score.toLocaleString("he-IL")} נקודות
        </motion.p>

        {/* Gold flash for winner — absolute is safe because parent has relative */}
        {isWinner && (
          <motion.div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            animate={{ opacity: [0, 0.18, 0] }}
            transition={{ duration: 0.7, repeat: 3, delay: 0.3 }}
            style={{ background: "radial-gradient(circle, #fbbf24, transparent 70%)" }}
          />
        )}
      </motion.div>

      {isCurrentPlayer && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, type: "spring" }}
          className="px-5 py-2 rounded-full bg-[#0070d1] text-white text-sm font-bold"
        >
          זה אתה! 🎉
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── FinishedView ──────────────────────────────────────────────────────────────

export default function FinishedView({ players, currentPlayerId }: Props) {
  const router  = useRouter();
  const [phase, setPhase] = useState<Phase>(0);
  const timers  = useRef<ReturnType<typeof setTimeout>[]>([]);

  const top3   = players.slice(0, 3);
  const myRank = players.findIndex((p) => p.id === currentPlayerId) + 1;

  // Schedule all phase advances upfront — proper cleanup of every timer
  useEffect(() => {
    let delay = 0;
    ([0, 1, 2, 3] as const).forEach((p) => {
      delay += PHASE_MS[p];
      const next = (p + 1) as Phase;
      timers.current.push(setTimeout(() => setPhase(next), delay));
    });
    return () => { timers.current.forEach(clearTimeout); timers.current = []; };
  }, []);

  function handleLeave() {
    clearSession();
    router.push("/");
  }

  return (
    <div className="flex flex-1 flex-col">
      <AnimatePresence mode="wait">

        {/* Phase 0 — anticipation */}
        {phase === 0 && (
          <motion.div
            key="anticipation"
            className="flex flex-1 flex-col items-center justify-center gap-6 px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 1.1, repeat: Infinity }}
              className="text-7xl"
            >
              🎊
            </motion.div>
            <h1 className="text-3xl font-extrabold text-slate-900 text-center">
              המשחק הסתיים!
            </h1>
            <motion.p
              className="text-slate-400 font-medium"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              מיד נחשוף את הזוכים…
            </motion.p>
            <div className="flex gap-2 mt-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#0070d1]"
                  animate={{ scale: [1, 1.6, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Phases 1–3 — sequential reveals: 3rd → 2nd → 1st */}
        {([1, 2, 3] as const).map((p) => {
          const playerIdx = REVEAL_ORDER[p - 1];
          const player    = top3[playerIdx];
          if (phase !== p || !player) return null;
          return (
            <RevealCard
              key={`reveal-${p}`}
              player={player}
              meta={PLACE_META[playerIdx]}
              placeIndex={playerIdx}
              isCurrentPlayer={player.id === currentPlayerId}
            />
          );
        })}

        {/* Phase 4 — full leaderboard */}
        {phase === 4 && (
          <motion.div
            key="leaderboard"
            className="flex flex-1 flex-col px-4 pt-6 pb-10 gap-5"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center">
              <span className="text-4xl">🏆</span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">תוצאות סופיות</h2>
              {myRank > 0 && (
                <p className="text-slate-500 mt-1 text-base">
                  {myRank === 1 ? "כל הכבוד, ניצחת! 🥇"
                    : myRank === 2 ? "מדהים, מקום שני! 🥈"
                    : myRank === 3 ? "יפה, מקום שלישי! 🥉"
                    : `סיימת במקום #${myRank}`}
                </p>
              )}
            </div>

            <GlassCard className="p-4 space-y-2" elevated>
              {players.map((player, i) => (
                <LeaderboardRow
                  key={player.id}
                  rank={i + 1}
                  nickname={player.nickname}
                  avatar={player.avatar}
                  score={player.score}
                  isCurrentPlayer={player.id === currentPlayerId}
                  animationIndex={i}
                />
              ))}
            </GlassCard>

            <Button variant="ghost" size="md" onClick={handleLeave}>
              ← חזור לדף הבית
            </Button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
