"use client";

import { motion } from "framer-motion";
import Avatar from "./Avatar";
import Badge from "./Badge";

interface LeaderboardRowProps {
  rank: number;
  nickname: string;
  avatar: string;
  score: number;
  /** Highlight this row (current player) */
  isCurrentPlayer?: boolean;
  /** Index in list for staggered entry animation */
  animationIndex?: number;
}

const RANK_MEDALS: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

export default function LeaderboardRow({
  rank,
  nickname,
  avatar,
  score,
  isCurrentPlayer = false,
  animationIndex = 0,
}: LeaderboardRowProps) {
  const medal = RANK_MEDALS[rank];

  return (
    <motion.div
      layout
      layoutId={`player-row-${nickname}`}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{
        layout:   { type: "spring", stiffness: 280, damping: 26 },
        opacity:  { duration: 0.25, delay: animationIndex * 0.06 },
        x:        { type: "spring", stiffness: 280, damping: 26, delay: animationIndex * 0.06 },
      }}
      className={[
        "flex items-center gap-4 px-5 py-3 rounded-2xl",
        isCurrentPlayer
          ? "bg-[#0070d1]/10 border-2 border-[#0070d1]/30"
          : "bg-white/70 border border-white/50",
        "shadow-sm",
      ].join(" ")}
    >
      {/* Rank */}
      <div className="shrink-0 w-9 text-center">
        {medal ? (
          <span className="text-2xl">{medal}</span>
        ) : (
          <span className="font-bold text-slate-400 text-lg">#{rank}</span>
        )}
      </div>

      {/* Avatar */}
      <Avatar emoji={avatar} size="sm" />

      {/* Name */}
      <span
        className={[
          "flex-1 font-semibold text-base truncate",
          isCurrentPlayer ? "text-[#0070d1]" : "text-slate-800",
        ].join(" ")}
      >
        {nickname}
        {isCurrentPlayer && (
          <span className="mr-2 text-xs font-normal text-[#0070d1]/70">(אתה)</span>
        )}
      </span>

      {/* Score */}
      <motion.div
        key={score}
        initial={{ scale: 1.4, color: "#0070d1" }}
        animate={{ scale: 1,   color: "#0f172a" }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="shrink-0 font-extrabold text-lg tabular-nums"
      >
        {score.toLocaleString("he-IL")}
      </motion.div>

      {/* "You" badge */}
      {isCurrentPlayer && (
        <Badge variant="blue">אתה</Badge>
      )}
    </motion.div>
  );
}
