"use client";

import { useState, type ComponentType } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { BellIcon, MailIcon, MessageIcon, ScanIcon } from "@/components/ui/icons";
import { Toggle } from "@/components/ui/Toggle";
import { cn } from "@/lib/cn";
import type { NotifyPrefs } from "@/lib/types";
import { th } from "@/locales/th";

const ROWS: { key: keyof NotifyPrefs; Icon: ComponentType<{ size?: number; strokeWidth?: number }> }[] = [
  { key: "app", Icon: BellIcon },
  { key: "sms", Icon: MessageIcon },
  { key: "email", Icon: MailIcon },
  { key: "autoMatch", Icon: ScanIcon },
];

/** Notification channel switches. Local state only until Phase 5 saves them. */
export function NotificationSettings({
  initial,
  className,
}: {
  initial: NotifyPrefs;
  className?: string;
}) {
  const [prefs, setPrefs] = useState(initial);

  return (
    <GlassCard className={cn("flex flex-col overflow-hidden", className)}>
      {ROWS.map(({ key, Icon }, i) => {
        const { label, sub } = th.myPlates.settings[key];
        return (
          <div key={key} className={cn("flex items-center gap-3 px-3.5 py-3", i > 0 && "border-t border-line")}>
            <span className="flex size-[38px] shrink-0 items-center justify-center rounded-xl bg-info-soft text-cta-mid">
              <Icon size={19} strokeWidth={2} />
            </span>
            <div className="flex min-w-0 grow flex-col">
              <span className="text-[14.5px] font-semibold">{label}</span>
              <span className="text-xs leading-[1.4] text-muted">{sub}</span>
            </div>
            <Toggle
              checked={prefs[key]}
              onChange={(on) => setPrefs((p) => ({ ...p, [key]: on }))}
              label={label}
            />
          </div>
        );
      })}
    </GlassCard>
  );
}
