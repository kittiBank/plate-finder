import { cn } from "@/lib/cn";
import { PlusIcon } from "./icons";
import { Pressable, type PressableProps } from "./Pressable";

type Size = "md" | "lg";

const base =
  "tap flex items-center justify-center gap-2 font-display font-semibold disabled:pointer-events-none disabled:opacity-50";

const sizes: Record<Size, string> = {
  md: "h-[46px] rounded-[15px] text-[15px]",
  lg: "h-[50px] rounded-button text-[15.5px]",
};

type ButtonProps = PressableProps & { size?: Size };

/** Main call to action: blue gradient. Pass `href` for navigation, otherwise it is a button. */
export function PrimaryButton({ size = "lg", className, ...props }: ButtonProps) {
  return (
    <Pressable
      className={cn(base, sizes[size], "bg-cta text-white shadow-cta", className)}
      {...props}
    />
  );
}

/** Secondary action: white with a blue border. */
export function OutlineButton({ size = "lg", className, ...props }: ButtonProps) {
  return (
    <Pressable
      className={cn(base, sizes[size], "border-2 border-aqua bg-white text-cta-mid", className)}
      {...props}
    />
  );
}

/** "Add something" row: dashed border with a plus tile. */
export function DashedAddButton({ className, children, ...props }: PressableProps) {
  return (
    <Pressable
      className={cn(
        base,
        "h-[58px] rounded-[20px] border-2 border-dashed border-[#8fc3e8] bg-white/50 text-[15px] text-cta-mid",
        className,
      )}
      {...props}
    >
      <span className="flex size-7 items-center justify-center rounded-[9px] bg-info-soft">
        <PlusIcon size={16} strokeWidth={2.4} />
      </span>
      {children}
    </Pressable>
  );
}
