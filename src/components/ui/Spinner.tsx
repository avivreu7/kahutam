interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-5 h-5 border-2",
  md: "w-8 h-8 border-[3px]",
  lg: "w-12 h-12 border-4",
};

/**
 * Simple spinning ring loader. Server-safe (CSS animation only).
 */
export default function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="טוען..."
      className={[
        "rounded-full border-[#0070d1]/30 border-t-[#0070d1] animate-spin",
        sizeMap[size],
        className,
      ].join(" ")}
    />
  );
}
