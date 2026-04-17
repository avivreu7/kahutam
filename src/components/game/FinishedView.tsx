"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

const PHASE_MS: Record<0 | 1 | 2 | 3, number> = {
  0: 1400,
  1: 2800,
  2: 2800,
  3: 3200,
};

const PLACE_META = [
  {
    medal: "🥇", label: "המנצח.ת!",
    glow: "shadow-[0_0_48px_#fbbf24bb]",
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

// ─── Confetti ──────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = [
  "#0070d1", "#d63384", "#198754", "#fd7e14",
  "#fbbf24", "#a855f7", "#06b6d4", "#f43f5e",
];

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        x: (i * 7.3 + 3) % 98,              // left %
        offsetX: ((i * 13) % 80) - 40,       // horizontal drift px
        delay: (i * 0.19) % 3.2,
        duration: 2.8 + (i % 6) * 0.35,
        rotate: (i * 53) % 360,
        shape: i % 3, // 0=square, 1=circle, 2=rect
      })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className={p.shape === 1 ? "absolute rounded-full" : "absolute rounded-sm"}
          style={{
            background: p.color,
            left: `${p.x}%`,
            top: "-3%",
            width: p.shape === 2 ? 10 : 8,
            height: p.shape === 2 ? 5 : 8,
          }}
          animate={{
            y: ["0vh", "108vh"],
            x: [0, p.offsetX],
            rotate: [p.rotate, p.rotate + 540],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeIn",
          }}
        />
      ))}
    </div>
  );
}

// ─── RevealCard ────────────────────────────────────────────────────────────────

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

      {/* Card */}
      <motion.div
        className={[
          "relative",
          `bg-linear-to-b ${meta.bg} border-2 ${meta.border}`,
          `${meta.glow} rounded-3xl p-8 flex flex-col items-center gap-4 w-full max-w-xs`,
        ].join(" ")}
        initial={isWinner
          ? { opacity: 0, scale: 0.35, y: -90 }
          : { opacity: 0, scale: 0.65, y: 70 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: isWinner ? 160 : 240,
          damping: isWinner ? 13 : 20,
          delay: 0.1,
        }}
      >
        <motion.span
          className={isWinner ? "text-7xl" : "text-5xl"}
          animate={isWinner
            ? { rotate: [-10, 10, -10], scale: [1, 1.15, 1] }
            : { rotate: [-5, 5, -5] }}
          transition={{ duration: isWinner ? 1.3 : 2, repeat: Infinity }}
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
          transition={{ delay: 0.55 }}
        >
          {player.score.toLocaleString("he-IL")} נקודות
        </motion.p>

        {/* Gold flash for winner */}
        {isWinner && (
          <motion.div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            animate={{ opacity: [0, 0.22, 0] }}
            transition={{ duration: 0.65, repeat: 4, delay: 0.25 }}
            style={{ background: "radial-gradient(circle, #fbbf24, transparent 70%)" }}
          />
        )}
      </motion.div>

      {isCurrentPlayer && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.75, type: "spring" }}
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
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const top3   = players.slice(0, 3);
  const myRank = players.findIndex((p) => p.id === currentPlayerId) + 1;

  // Schedule all phase advances upfront
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

  const showConfetti = phase >= 3;

  return (
    <div className="flex flex-1 flex-col">
      {/* Confetti during winner + leaderboard phases */}
      {showConfetti && <Confetti />}

      <AnimatePresence mode="wait">

        {/* Phase 0 — anticipation */}
        {phase === 0 && (
          <motion.div
            key="anticipation"
            className="flex flex-1 flex-col items-center justify-center gap-6 px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              animate={{ scale: [1, 1.14, 1], rotate: [-5, 5, -5] }}
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
                  className="w-2.5 h-2.5 rounded-full bg-[#0070d1]"
                  animate={{ scale: [1, 1.7, 1], opacity: [0.3, 1, 0.3] }}
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
            initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
          >
            <div className="text-center">
              <motion.span
                className="text-5xl block"
                animate={{ rotate: [-8, 8, -8], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🏆
              </motion.span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">תוצאות סופיות</h2>
              {myRank > 0 && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-slate-500 mt-1 text-base"
                >
                  {myRank === 1 ? "כל הכבוד, ניצחת! 🥇"
                    : myRank === 2 ? "מדהים, מקום שני! 🥈"
                    : myRank === 3 ? "יפה, מקום שלישי! 🥉"
                    : `סיימת במקום #${myRank}`}
                </motion.p>
              )}
            </div>

            <GlassCard className="p-4 space-y-2 flex-1 overflow-y-auto scrollbar-hide" elevated>
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
