type BadgeVariant = "blue" | "green" | "orange" | "slate" | "red";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  blue:   "bg-[#0070d1]/15 text-[#0070d1] border-[#0070d1]/20",
  green:  "bg-[#22c55e]/15 text-[#15803d] border-[#22c55e]/20",
  orange: "bg-[#fd7e14]/15 text-[#c05600] border-[#fd7e14]/20",
  slate:  "bg-slate-100    text-slate-600  border-slate-200",
  red:    "bg-[#ef4444]/15 text-[#b91c1c] border-[#ef4444]/20",
};

/**
 * Compact pill badge for streaks, score deltas, and rank labels.
 * Server-safe.
 */
export default function Badge({
  children,
  variant = "slate",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 px-2.5 py-0.5",
        "rounded-full text-xs font-semibold border",
        variantClasses[variant],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
