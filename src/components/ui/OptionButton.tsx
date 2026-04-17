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

const META = [
  { letter: "א", bg: "#0070d1", glow: "rgba(0,112,209,0.55)",    shape: "▲" },
  { letter: "ב", bg: "#d63384", glow: "rgba(214,51,132,0.55)",   shape: "◆" },
  { letter: "ג", bg: "#198754", glow: "rgba(25,135,84,0.55)",    shape: "■" },
  { letter: "ד", bg: "#fd7e14", glow: "rgba(253,126,20,0.55)",   shape: "●" },
] as const;

const STATE_ICON: Partial<Record<OptionState, string>> = {
  correct: "✓",
  wrong:   "✗",
  missed:  "✓",
};

interface OptionButtonProps {
  index: 0 | 1 | 2 | 3;
  text: string;
  state?: OptionState;
  onClick?: () => void;
}

export default function OptionButton({
  index,
  text,
  state = "idle",
  onClick,
}: OptionButtonProps) {
  const m        = META[index];
  const disabled = state !== "idle";
  const icon     = STATE_ICON[state];

  // Background colour
  const bg =
    state === "correct" || state === "missed" ? "#16a34a" : m.bg;

  // Box shadow / glow
  const shadow =
    state === "idle"
      ? `0 4px 18px ${m.glow}, 0 1px 4px rgba(0,0,0,0.12)`
      : state === "selected"
      ? `0 0 0 3px white, 0 0 0 6px ${m.bg}, 0 10px 32px ${m.glow}`
      : state === "correct"
      ? `0 0 0 3px white, 0 0 0 6px #16a34a, 0 10px 36px rgba(22,163,74,0.65)`
      : state === "missed"
      ? `0 0 0 3px white, 0 0 0 6px #16a34a, 0 8px 24px rgba(22,163,74,0.45)`
      : "none";

  return (
    <motion.button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={`אפשרות ${m.letter}: ${text}`}
      initial={{ opacity: 0, y: 32, scale: 0.86 }}
      animate={{
        opacity: state === "disabled" ? 0.28 : state === "wrong" ? 0.42 : 1,
        y: 0,
        scale:
          state === "disabled" ? 0.95
          : state === "selected" ? 1.025
          : state === "correct" || state === "missed" ? 1.01
          : 1,
        x: state === "wrong" ? [-7, 7, -5, 5, 0] : 0,
        filter:
          state === "wrong"
            ? "saturate(0.1) brightness(0.65)"
            : "saturate(1) brightness(1)",
      }}
      transition={{
        y:      { type: "spring", stiffness: 280, damping: 22, delay: index * 0.08 },
        scale:  { type: "spring", stiffness: 420, damping: 26 },
        x:      { duration: 0.38, ease: "easeOut" },
        opacity:{ duration: 0.22 },
        filter: { duration: 0.3 },
      }}
      whileTap={disabled ? {} : { scale: 0.93 }}
      className={[
        "relative w-full min-h-21 flex items-center gap-4 px-5 py-4",
        "rounded-2xl select-none no-select tap-highlight",
        "text-right text-white font-bold text-lg leading-snug",
        disabled ? "cursor-default" : "cursor-pointer",
      ].join(" ")}
      style={{
        backgroundColor: bg,
        boxShadow: shadow,
        transition: "background-color 0.32s ease, box-shadow 0.25s ease",
      }}
    >
      {/* Shape badge */}
      <span
        className="shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-black/20 text-2xl font-black"
        aria-hidden
      >
        {m.shape}
      </span>

      {/* Option text */}
      <span className="flex-1 text-right">{text}</span>

      {/* Result icon */}
      {icon && (
        <motion.span
          initial={{ scale: 0, rotate: -25 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 520, damping: 22 }}
          className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-white/25 text-xl font-black"
        >
          {icon}
        </motion.span>
      )}

      {/* Pulsing glow when selected */}
      {state === "selected" && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          animate={{ opacity: [0.35, 0] }}
          transition={{ duration: 1.1, repeat: Infinity }}
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.28), transparent 70%)",
          }}
        />
      )}

      {/* Flash on correct */}
      {(state === "correct" || state === "missed") && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{ background: "rgba(255,255,255,0.35)" }}
        />
      )}
    </motion.button>
  );
}
