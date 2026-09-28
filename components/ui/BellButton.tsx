import { th } from "@/locales/th";
import { BellIcon } from "./icons";
import { IconButton } from "./IconButton";
import type { PressableProps } from "./Pressable";

type Props = PressableProps & { unreadCount?: number };

/** Notifications bell for the hero header. Shows a yellow dot when there is something unread. */
export function BellButton({ unreadCount = 0, ...props }: Props) {
  const label =
    unreadCount > 0 ? th.header.notificationsUnread(unreadCount) : th.header.notifications;
  return (
    <IconButton label={label} variant="glass-dark" {...props}>
      <BellIcon size={22} />
      {unreadCount > 0 && (
        <span className="absolute top-2 right-[9px] size-2.5 rounded-full border-2 border-[#2f80bf] bg-accent" />
      )}
    </IconButton>
  );
}
