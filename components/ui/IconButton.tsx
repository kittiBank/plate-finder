import { cn } from "@/lib/cn";
import { Pressable, type PressableProps } from "./Pressable";

type Variant = "glass-dark" | "glass-light" | "cta" | "ghost" | "plain";
type Size = 44 | 48 | 52;

const variants: Record<Variant, string> = {
  /** On the blue hero. */
  "glass-dark": "border border-white/35 bg-white/16 text-white backdrop-blur-md",
  /** On light backgrounds / over the map. */
  "glass-light":
    "border border-white bg-white/85 text-deep shadow-[0_8px_20px_rgba(44,62,80,0.16)] backdrop-blur-md",
  cta: "bg-cta text-white shadow-[0_10px_22px_rgba(26,111,196,0.35)]",
  ghost: "bg-transparent text-[#7f8c8d]",
  /** No background; style it entirely through `className`. */
  plain: "",
};

const sizes: Record<Size, string> = {
  44: "size-11 rounded-[14px]",
  48: "size-12 rounded-2xl",
  52: "size-[52px] rounded-[18px]",
};

type Props = PressableProps & {
  /** Accessible name — icon buttons have no visible text. */
  label: string;
  variant?: Variant;
  size?: Size;
};

export function IconButton({ label, variant = "glass-light", size = 44, className, ...props }: Props) {
  return (
    <Pressable
      aria-label={label}
      className={cn(
        "tap relative flex shrink-0 cursor-pointer items-center justify-center",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
