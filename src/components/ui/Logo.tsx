interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "text-2xl",
  md: "text-4xl",
  lg: "text-6xl",
};

/**
 * Kahutam wordmark — server-safe.
 */
export default function Logo({ size = "md", className = "" }: LogoProps) {
  return (
    <div className={`inline-flex items-baseline gap-0.5 font-extrabold ${sizeMap[size]} ${className}`}>
      <span className="text-slate-900">קהו</span>
      <span className="text-[#0070d1]">טם</span>
      {/* PS-inspired coloured dot accent */}
      <span
        className="mr-1 inline-block w-2 h-2 rounded-full bg-[#0070d1] self-center mb-1"
        aria-hidden
      />
    </div>
  );
}
