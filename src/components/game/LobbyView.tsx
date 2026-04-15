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

export default function LobbyView({ players, currentPlayerId, nickname, avatar }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-between px-4 pt-8 pb-10">

      {/* Header */}
      <motion.div
        className="text-center space-y-2"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Logo size="md" />
        <p className="text-slate-500 font-medium">ממתין לתחילת המשחק…</p>
      </motion.div>

      {/* Pulse animation + player count */}
      <div className="flex flex-col items-center gap-6 my-6">
        <motion.div
          className="relative"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-28 h-28 rounded-full bg-[#0070d1]/10 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-[#0070d1]/20 flex items-center justify-center">
              <span className="text-4xl font-extrabold text-[#0070d1]">
                {players.length}
              </span>
            </div>
          </div>
          {/* Ripple rings */}
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-[#0070d1]/30"
              animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 1, ease: "easeOut" }}
            />
          ))}
        </motion.div>
        <p className="text-slate-500 text-base">
          {players.length === 1 ? "שחקן אחד הצטרף" : `${players.length} שחקנים הצטרפו`}
        </p>
      </div>

      {/* Player list */}
      <GlassCard className="w-full max-w-sm p-4 space-y-2" elevated>
        <h2 className="text-sm font-semibold text-slate-500 mb-3 text-center">
          שחקנים בחדר
        </h2>
        <AnimatePresence mode="popLayout">
          {players.map((p, i) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 28 }}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-xl",
                p.id === currentPlayerId
                  ? "bg-[#0070d1]/10 border border-[#0070d1]/20"
                  : "bg-white/60",
              ].join(" ")}
            >
              <Avatar emoji={p.avatar} size="sm" />
              <span className={[
                "flex-1 font-semibold text-base",
                p.id === currentPlayerId ? "text-[#0070d1]" : "text-slate-700",
              ].join(" ")}>
                {p.nickname}
                {p.id === currentPlayerId && (
                  <span className="mr-1 text-xs font-normal text-[#0070d1]/60">(אתה)</span>
                )}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </GlassCard>

      {/* Waiting indicator */}
      <div className="flex items-center gap-2 text-slate-400 text-sm mt-6">
        <Spinner size="sm" />
        <span>המנחה יתחיל בקרוב</span>
      </div>
    </div>
  );
}
