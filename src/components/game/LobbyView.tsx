"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GlassCard, Avatar, Logo, Spinner } from "@/components/ui";
import type { Player } from "@/types/game";

interface Props {
  players: Player[];
  currentPlayerId: string;
  nickname: string;
  avatar: string;
}

// Deterministic floating particles (no Math.random → no hydration mismatch)
const PARTICLES = [
  { emoji: "🎊", x: 8,  delay: 0,    dur: 7  },
  { emoji: "⭐", x: 22, delay: 1.2,  dur: 9  },
  { emoji: "🎯", x: 38, delay: 0.5,  dur: 8  },
  { emoji: "🏆", x: 55, delay: 2.1,  dur: 10 },
  { emoji: "✨", x: 68, delay: 0.8,  dur: 7  },
  { emoji: "🎉", x: 82, delay: 1.7,  dur: 9  },
  { emoji: "💫", x: 15, delay: 3.0,  dur: 8  },
  { emoji: "🌟", x: 47, delay: 2.5,  dur: 11 },
  { emoji: "🔥", x: 73, delay: 0.3,  dur: 8  },
  { emoji: "🎈", x: 91, delay: 1.4,  dur: 10 },
];

export default function LobbyView({ players, currentPlayerId, nickname, avatar }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-between px-4 pt-8 pb-10 relative overflow-hidden">

      {/* Floating particle emojis */}
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="absolute bottom-0 text-2xl pointer-events-none select-none"
          style={{ left: `${p.x}%` }}
          animate={{
            y: [0, -700],
            opacity: [0, 0.65, 0.65, 0],
            scale: [0.5, 1, 0.85],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeOut",
          }}
        >
          {p.emoji}
        </motion.span>
      ))}

      {/* Header */}
      <motion.div
        className="text-center space-y-2 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
      >
        <Logo size="md" />
        <motion.p
          className="text-slate-500 font-medium"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          ממתין לתחילת המשחק…
        </motion.p>
      </motion.div>

      {/* Pulsing player-count orb */}
      <div className="flex flex-col items-center gap-4 my-2 z-10">
        <motion.div
          className="relative"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Ripple rings */}
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-[#0070d1]/35"
              animate={{ scale: [1, 1.7], opacity: [0.55, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: i * 1.1, ease: "easeOut" }}
            />
          ))}
          <div className="w-28 h-28 rounded-full bg-[#0070d1]/10 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-[#0070d1]/20 flex items-center justify-center">
              <motion.span
                key={players.length}
                initial={{ scale: 1.5, opacity: 0.4 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="text-4xl font-black text-[#0070d1]"
              >
                {players.length}
              </motion.span>
            </div>
          </div>
        </motion.div>
        <p className="text-slate-500 text-base font-medium z-10">
          {players.length === 1 ? "שחקן אחד הצטרף" : `${players.length} שחקנים הצטרפו`}
        </p>
      </div>

      {/* Player list */}
      <GlassCard className="w-full max-w-sm p-4 space-y-2 z-10" elevated>
        <h2 className="text-sm font-semibold text-slate-500 mb-3 text-center">
          שחקנים בחדר
        </h2>
        <div className="max-h-52 overflow-y-auto scrollbar-hide space-y-2">
          <AnimatePresence mode="popLayout">
            {players.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, x: 40, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.9 }}
                transition={{ delay: i * 0.04, type: "spring", stiffness: 320, damping: 28 }}
                className={[
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl",
                  p.id === currentPlayerId
                    ? "bg-[#0070d1]/10 border border-[#0070d1]/25"
                    : "bg-white/60",
                ].join(" ")}
              >
                <Avatar emoji={p.avatar} size="sm" />
                <span
                  className={[
                    "flex-1 font-semibold text-base",
                    p.id === currentPlayerId ? "text-[#0070d1]" : "text-slate-700",
                  ].join(" ")}
                >
                  {p.nickname}
                  {p.id === currentPlayerId && (
                    <span className="mr-1 text-xs font-normal text-[#0070d1]/60">(אתה)</span>
                  )}
                </span>
                {p.id === currentPlayerId && (
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-lg"
                  >
                    {p.avatar}
                  </motion.span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </GlassCard>

      {/* Waiting indicator */}
      <div className="flex items-center gap-2 text-slate-400 text-sm mt-4 z-10">
        <Spinner size="sm" />
        <span>המנחה יתחיל בקרוב</span>
      </div>
    </div>
  );
}
