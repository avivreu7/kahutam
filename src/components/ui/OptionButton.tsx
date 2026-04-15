"use client";

import { motion } from "framer-motion";

/** Visual state of an answer option */
export type OptionState =
  | "idle"       // default – question is active, not yet chosen
  | "selected"   // player picked this one, waiting for reveal
  | "correct"    // reveal: this was the right answer
  | "wrong"      // reveal: player picked this but it was wrong
  | "missed"     // reveal: this was correct but player picked something else
  | "disabled";  // reveal: irrelevant wrong option

const OPTION_META = [
  {
    letter: "א",
    idle: "bg-[#0070d1]",
    ring: "ring-[#004fa0]",
    shape: "▲",
  },
  {
    letter: "ב",
    idle: "bg-[#d63384]",
    ring: "ring-[#a0245e]",
    shape: "●",
  },
  {
    letter: "ג",
    idle: "bg-[#198754]",
    ring: "ring-[#0f5233]",
    shape: "■",
  },
  {
    letter: "ד",
    idle: "bg-[#fd7e14]",
    ring: "ring-[#c45e00]",
    shape: "✕",
  },
] as const;

interface OptionButtonProps {
  index: 0 | 1 | 2 | 3;
  text: string;
  state?: OptionState;
  onClick?: () => void;
}

const stateOverlay: Record<OptionState, string> = {
  idle:     "",
  selected: "ring-4",
  correct:  "ring-4 brightness-110",
  wrong:    "opacity-50 saturate-50",
  missed:   "ring-4 brightness-110",
  disabled: "opacity-35 saturate-0",
};

const stateIcon: Partial<Record<OptionState, string>> = {
  correct: "✓",
  wrong:   "✗",
  missed:  "✓",
};

export default function OptionButton({
  index,
  text,
  state = "idle",
  onClick,
}: OptionButtonProps) {
  const meta      = OPTION_META[index];
  const isDisabled = state !== "idle";
  const overlay   = stateOverlay[state];
  const icon      = stateIcon[state];

  return (
    <motion.button
      type="button"
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      aria-label={`אפשרות ${meta.letter}: ${text}`}
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24, delay: index * 0.07 }}
      className={[
        // base layout
        "relative w-full min-h-[72px] flex items-center gap-4 px-5 py-4",
        "rounded-2xl select-none no-select tap-highlight",
        "text-right text-white font-semibold text-lg leading-snug",
        "transition-all duration-200",
        // colour
        meta.idle,
        meta.ring,
        // state overlay
        overlay,
        isDisabled ? "cursor-default" : "cursor-pointer",
      ].join(" ")}
    >
      {/* Letter badge */}
      <span className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-black/20 font-bold text-xl">
        {meta.letter}
      </span>

      {/* Option text */}
      <span className="flex-1 text-right">{text}</span>

      {/* State icon */}
      {icon && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/25 text-lg font-bold"
        >
          {icon}
        </motion.span>
      )}
    </motion.button>
  );
}
