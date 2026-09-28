import { cn } from "@/lib/cn";

type Props = {
  /** Hero height in px (Home 378, My Plates 230). */
  height: number;
  /** `full` has two glows and two waves (Home); `compact` has one of each. */
  variant?: "full" | "compact";
  className?: string;
};

/** Decorative blue gradient behind the top of a tab screen. Content is laid over it. */
export function HeroBackground({ height, variant = "full", className }: Props) {
  const full = variant === "full";
  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute inset-x-0 top-0 overflow-hidden rounded-b-hero bg-hero",
        className,
      )}
      style={{ height }}
    >
      <div className="absolute -top-20 -right-20 size-[250px] rounded-full bg-[radial-gradient(circle,rgba(126,214,255,0.55),rgba(126,214,255,0)_70%)] animate-float" />
      {full && (
        <div className="absolute top-[150px] -left-20 size-[200px] rounded-full bg-[radial-gradient(circle,rgba(52,152,219,0.6),rgba(52,152,219,0)_70%)] animate-float [animation-delay:-3s]" />
      )}
      <svg
        viewBox="0 0 390 90"
        preserveAspectRatio="none"
        className={cn("absolute bottom-0 left-0 w-full", full ? "h-[90px] opacity-18" : "h-[70px] opacity-16")}
        fill="#fff"
      >
        <path d="M0 40c40-16 80-16 120 0s80 16 120 0 80-16 120 0 30 10 30 10v40H0z" />
        {full && <path d="M0 62c40-12 80-12 120 0s80 12 120 0 80-12 120 0 30 8 30 8v20H0z" />}
      </svg>
    </div>
  );
}
