"use client";

import { useState } from "react";
import { Toggle } from "@/components/ui/Toggle";

/** Home card's notification switch. Local state only until Phase 5 saves it. */
export function NotifyToggle({ initial, label }: { initial: boolean; label: string }) {
  const [on, setOn] = useState(initial);
  return <Toggle checked={on} onChange={setOn} label={label} size="sm" />;
}
