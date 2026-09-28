import { th } from "@/locales/th";
import { UserIcon } from "./icons";
import { IconButton } from "./IconButton";
import type { PressableProps } from "./Pressable";

/** Round avatar button for the hero header. */
export function ProfileButton(props: PressableProps) {
  return (
    <IconButton
      label={th.header.profile}
      variant="plain"
      className="rounded-full border-2 border-white/70 bg-[linear-gradient(135deg,#7ed6ff,#3498db)] text-white"
      {...props}
    >
      <UserIcon size={22} />
    </IconButton>
  );
}
