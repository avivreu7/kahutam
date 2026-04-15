type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  emoji: string;
  size?: AvatarSize;
  className?: string;
}

const sizeMap: Record<AvatarSize, { wrap: string; text: string }> = {
  sm: { wrap: "w-10 h-10",  text: "text-xl" },
  md: { wrap: "w-14 h-14",  text: "text-3xl" },
  lg: { wrap: "w-20 h-20",  text: "text-5xl" },
  xl: { wrap: "w-28 h-28",  text: "text-7xl" },
};

/**
 * Emoji avatar displayed inside a frosted circle.
 * Server-safe (no motion, no client state).
 */
export default function Avatar({ emoji, size = "md", className = "" }: AvatarProps) {
  const { wrap, text } = sizeMap[size];
  return (
    <div
      className={[
        "flex items-center justify-center rounded-full",
        "bg-white border-2 border-white/60 shadow-md",
        wrap,
        className,
      ].join(" ")}
    >
      <span className={text} role="img" aria-label="avatar">
        {emoji}
      </span>
    </div>
  );
}
